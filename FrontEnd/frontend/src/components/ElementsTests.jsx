import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import styles from "./StyleComponents/Elements.module.css";

const apiUrl = import.meta.env.VITE_API_URL;

function ElementsTests({ idAssignatura }) {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [conceptes, setConceptes] = useState([]);
  const [conceptesSeleccionats, setConceptesSeleccionats] = useState([]);
  const [errorFormulari, setErrorFormulari] = useState("");

  // Recuperar només els conceptes associats a l'assignatura
  useEffect(() => {
    if (idAssignatura) {
      axios
        .get(`${apiUrl}/recoverElementsTest`, {
          params: { idAssignatura },
        })
        .then((res) => {
          const filteredConceptes = res.data.filter(
            (concept) => concept.value !== null && concept.label !== null
          );

          setConceptes(filteredConceptes);
        })
        .catch((err) =>
          console.error("Error al recuperar els conceptes:", err)
        );
    }
  }, [idAssignatura]);

  // Enviar formulari creació de test
  const handleSubmit = (e) => {
    e.preventDefault();

    if (conceptesSeleccionats.length === 0) {
      setErrorFormulari("Selecciona almenys un concepte.");
      return;
    }

    setErrorFormulari("");

    const conceptesSeleccionatsIds = conceptesSeleccionats.map(
      (concepte) => concepte.value
    );

    const parametersTest = {
      conceptesSeleccionats: conceptesSeleccionatsIds,
    };

    navigate("/testlayout", { state: { parametersTest, idAssignatura } });
  };

  // Generar tests amb IA
  const handleTestIA = () => {
    navigate("/testIA", { state: { idAssignatura } });
  };

  return (
    <div className={styles.quizzContainerTitle}>
      <strong className={styles.titleGenerator}>GENERADOR DE TESTS</strong>
      <div className={styles.quizzContainerBody}>
        <form className={styles.formRandom} onSubmit={handleSubmit}>
          <div className={styles.parametersQuizz}>
            <label htmlFor="conceptes">Conceptes:</label>
            <Select
              id="conceptes"
              name="conceptes"
              options={conceptes}
              isMulti
              onChange={(seleccionats) =>
                setConceptesSeleccionats(seleccionats || [])
              }
              value={conceptesSeleccionats}
              className={styles.select}
              placeholder="Selecciona un concepte"
            />
          </div>

          {errorFormulari && <p className={styles.error}>{errorFormulari}</p>}

          <button type="submit" className={styles.buttonSubmit}>
            Generar Test
          </button>
        </form>

        <button
          type="button"
          className={styles.buttonSubmit}
          onClick={handleTestIA}
        >
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
