import styles from "./Elements.module.css";
import PropTypes from "prop-types";
import axios from "axios";
import { useState, useEffect } from "react";

function ElementsTests({ idAssignatura }) {
  const [temes, setTemes] = useState([]);
  const [selectedTema, setSelectedTema] = useState("");
  const [conceptes, setConceptes] = useState([]);

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

        console.log(temas.tots_els_conceptes);
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
      console.log(conceptes);
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
              onChange={(e) => setSelectedTema(e.target.value)}
              placeholder="Selecciona un tema"
            >
              <option value="">Selecciona un tema</option>
              {temes.map((tema) => (
                <option key={tema.id_tema} value={tema.id_tema}>
                  {tema.nom_tema}
                </option>
              ))}
            </select>
            <label htmlFor="tema">Conceptes:</label>
            <select
              id="conceptes"
              name="conceptes"
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
              placeholder="Selecciona la dificultad"
            >
              <option>Fàcil</option>
              <option>Mitjà</option>
              <option>Difícil</option>
            </select>
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
