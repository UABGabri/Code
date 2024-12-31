import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import styles from "./StyleComponents/Elements.module.css";

function ElementsTests({ idAssignatura }) {
  const navigate = useNavigate();
  const [conceptes, setConceptes] = useState([]);
  const [conceptesSeleccionats, setConceptesSeleccionats] = useState([]);
  const [errorFormulari, setErrorFormulari] = useState("");

  // Recuperar només els conceptes associats a l'assignatura
  useEffect(() => {
    if (idAssignatura) {
      axios
        .get("http://localhost:8081/recoverElementsTest", {
          params: { idAssignatura },
        })
        .then((res) => {
          setConceptes(res.data);
        })
        .catch((err) =>
          console.error("Error al recuperar los conceptos:", err)
        );
    }
  }, [idAssignatura]);

  // Enviar formulari
  const handleSubmit = (e) => {
    e.preventDefault();

    if (conceptesSeleccionats.length === 0) {
      setErrorFormulari("Select at least one concept.");
      return;
    }

    setErrorFormulari("");

    const conceptesSeleccionatsIds = conceptesSeleccionats.map(
      (concepte) => concepte.value
    );

    const parametersTest = {
      conceptesSeleccionats: conceptesSeleccionatsIds,
      //idAssignatura,
    };

    //console.log("Parámetros para el test: ", parametersTest);

    navigate("/testlayout", { state: { parametersTest } });
  };

  // Generar test amb IA
  const handleTestIA = () => {
    navigate("/testIA", { state: { idAssignatura } });
  };

  return (
    <div className={styles.quizzContainerTitle}>
      <strong className={styles.titleGenerator}>QUIZZ GENERATOR</strong>
      <div className={styles.quizzContainerBody}>
        <form className={styles.formRandom} onSubmit={handleSubmit}>
          <div className={styles.parametersQuizz}>
            <label htmlFor="conceptes">Concepts:</label>
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
          className={styles.buttonIA}
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
