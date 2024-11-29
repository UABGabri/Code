import styles from "./StyleComponents/Elements.module.css";
import PropTypes from "prop-types";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ElementsTests({ idAssignatura }) {
  const navigate = useNavigate();
  const [temes, setTemes] = useState([]);
  const [selectedTema, setSelectedTema] = useState("");
  const [conceptes, setConceptes] = useState([]);
  const [selectedConcepte, setSelectedConcepte] = useState("");
  const [parametersTest, setParametersTest] = useState({
    tema: "",
    concepte: "",
    dificultat: "",
  });
  const [formError, setFormError] = useState("");

  const recoverTemasAssignatura = () => {
    axios
      .get("http://localhost:8081/recoverElementsTest", {
        params: { idAssignatura },
      })
      .then((res) => {
        const temas = res.data.map((item) => ({
          id_tema: item.id_tema,
          nom_tema: item.tema,
          tots_els_conceptes: item.tots_els_conceptes,
        }));
        setTemes(temas);
      })
      .catch((error) => {
        console.error("Error al recuperar els temes:", error);
      });
  };

  useEffect(() => {
    if (selectedTema) {
      const temaSeleccionat = temes.find(
        (tema) => tema.nom_tema === selectedTema
      );
      if (temaSeleccionat) {
        const conceptesArray = temaSeleccionat.tots_els_conceptes
          .split(",")
          .map((concepte) => concepte.trim());
        setConceptes(conceptesArray);
      }
    } else {
      setConceptes([]);
    }
  }, [selectedTema, temes]);

  useEffect(() => {
    if (idAssignatura) {
      recoverTemasAssignatura();
    }
  }, [idAssignatura]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { tema, concepte, dificultat } = parametersTest;

    if (!tema || !concepte || !dificultat) {
      setFormError("Sisplau, emplena tots els camps per continuar");
      return;
    }

    setFormError("");
    console.log("Formulario enviado con:", parametersTest);
    navigate("/testlayout", { state: { parametersTest } });
  };

  return (
    <div>
      <div className={styles.quizzContainerTitle}>
        <h1 className={styles.titleGenerator}>GENERADOR DE TESTS</h1>
        <div className={styles.quizzContainerBody}>
          <form onSubmit={handleSubmit}>
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

            <label htmlFor="dificultat">Dificultat:</label>
            <select
              id="dificultat"
              name="dificultat"
              value={parametersTest.dificultat}
              onChange={(e) => {
                const dificultat = e.target.value;
                setParametersTest((prevState) => ({
                  ...prevState,
                  dificultat: dificultat,
                }));
              }}
            >
              <option value="">Selecciona una dificultat</option>
              <option value="Fàcil">Fàcil</option>
              <option value="Mitjà">Mitjà</option>
              <option value="Difícil">Difícil</option>
            </select>

            {formError && <p className={styles.error}>{formError}</p>}

            <button type="submit">Generar Test</button>
          </form>
        </div>
      </div>
    </div>
  );
}

ElementsTests.propTypes = {
  idAssignatura: PropTypes.string.isRequired,
};

export default ElementsTests;
