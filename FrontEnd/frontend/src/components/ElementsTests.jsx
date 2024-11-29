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
    tema: selectedTema,
    concepte: selectedConcepte,
    dificultat: "",
  });

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
    console.log(parametersTest); //no pasa bien las cosas de la dificultat aqui. Arreglar eso.
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
                setSelectedTema(e.target.value);
                setParametersTest((prevState) => ({
                  ...prevState,
                  tema: e.target.value,
                }));
              }}
              placeholder="Selecciona un tema"
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
                setSelectedConcepte(e.target.value);
                setParametersTest((prevState) => ({
                  ...prevState,
                  concepte: e.target.value,
                }));
              }}
              placeholder="Selecciona un concepte"
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
              onChange={(e) => {
                const dificultat = e.target.value;
                setParametersTest((prevState) => ({
                  ...prevState,
                  dificultat: dificultat,
                }));
              }}
              value={parametersTest.dificultat}
              placeholder="Selecciona la dificultad"
            >
              <option value="Fàcil">Fàcil</option>
              <option value="Mitjà">Mitjà</option>
              <option value="Difícil">Difícil</option>
            </select>

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
