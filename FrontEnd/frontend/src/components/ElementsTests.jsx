import styles from "./StyleComponents/Elements.module.css";
import PropTypes from "prop-types";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//Creació de tests randoms -> futur creació tests intel·ligents
function ElementsTests({ idAssignatura }) {
  const Id_Assignatura = idAssignatura;
  const navigate = useNavigate();
  const [temes, setTemes] = useState([]);
  const [selectedTema, setSelectedTema] = useState("");
  const [conceptes, setConceptes] = useState([]);
  const [selectedConcepte, setSelectedConcepte] = useState("");
  const [parametersTest, setParametersTest] = useState({
    tema: "",
    concepte: "",
    id_Assignatura: idAssignatura,
  });
  const [formError, setFormError] = useState("");

  // Recupera temes i conceptes
  const recoverTemasAssignatura = () => {
    axios
      .get("http://localhost:8081/recoverElementsTest", {
        params: { idAssignatura },
      })
      .then((res) => {
        const temas = res.data.map((item) => ({
          id_tema: item.id_tema,
          nom_tema: item.tema,
          tots_els_conceptes: item.tots_els_conceptes
            ? [
                ...new Set(
                  item.tots_els_conceptes
                    .split(",")
                    .map((concepto) => concepto.trim())
                ),
              ]
            : [], // Si tots_els_conceptes es null o undefined, asigna un array buit per evitar la seva creació
        }));
        setTemes(temas);
      })
      .catch((error) => {
        console.error("Error al recuperar els temes:", error);
      });
  };

  // Actualitza els conceptes disponibles en seleccionar un tema
  useEffect(() => {
    if (selectedTema) {
      const temaSeleccionado = temes.find(
        (tema) => tema.nom_tema === selectedTema
      );
      if (temaSeleccionado) {
        setConceptes(temaSeleccionado.tots_els_conceptes);
      }
    } else {
      setConceptes([]);
    }
  }, [selectedTema, temes]);

  // Recupera els temes en carregar el component
  useEffect(() => {
    if (idAssignatura) {
      recoverTemasAssignatura();
    }
  }, [idAssignatura]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { tema, concepte } = parametersTest;

    if (!tema || !concepte) {
      setFormError("Sisplau, emplena tots els camps per continuar");
      return;
    }

    setFormError("");
    navigate("/testlayout", { state: { parametersTest } });
  };

  const handleTestIA = () => {
    navigate("/testIA", { state: { Id_Assignatura } });
  };

  return (
    <div className={styles.quizzContainerTitle}>
      <h1 className={styles.titleGenerator}>GENERADOR DE TESTS</h1>
      <div className={styles.quizzContainerBody}>
        <form className={styles.formRandom} onSubmit={handleSubmit}>
          <div className={styles.parametersQuizz}>
            <label htmlFor="tema">Tema:</label>
            <select
              id="tema"
              name="id_tema"
              value={selectedTema}
              onChange={(e) => {
                const tema = e.target.value;
                setSelectedTema(tema);
                setParametersTest((prevState) => ({
                  ...prevState,
                  tema: tema,
                }));
              }}
            >
              <option value="">Selecciona un tema</option>
              {temes.map((tema) => (
                <option key={tema.id_tema} value={tema.nom_tema}>
                  {tema.nom_tema}
                </option>
              ))}
            </select>

            <label htmlFor="conceptes">Conceptes:</label>
            <select
              id="conceptes"
              name="conceptes"
              value={selectedConcepte}
              onChange={(e) => {
                const concepte = e.target.value;
                setSelectedConcepte(concepte);
                setParametersTest((prevState) => ({
                  ...prevState,
                  concepte: concepte,
                }));
              }}
            >
              <option value="">Selecciona un concepte</option>
              {conceptes.map((concepte, index) => (
                <option key={index} value={concepte}>
                  {concepte}
                </option>
              ))}
            </select>
          </div>

          {formError && <p className={styles.error}>{formError}</p>}

          <button type="submit">Generar Test</button>
        </form>

        <button style={{ background: "red" }} onClick={handleTestIA}>
          Generar Test IA
        </button>
      </div>
    </div>
  );
}

ElementsTests.propTypes = {
  idAssignatura: PropTypes.string.isRequired,
};

export default ElementsTests;
