import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import styles from "./StyleComponents/Elements.module.css";

function ElementsTests({ idAssignatura }) {
  const navigate = useNavigate();
  const [temes, setTemes] = useState([]);
  const [temesSeleccionats, setTemesSeleccionats] = useState([]);
  const [conceptes, setConceptes] = useState([]);
  const [conceptesSeleccionats, setConceptesSeleccionats] = useState([]);
  const [errorFormulari, setErrorFormulari] = useState("");

  // Recuperar temes i conceptes associats a l'assignatura
  useEffect(() => {
    if (idAssignatura) {
      axios
        .get("http://localhost:8081/recoverElementsTest", {
          params: { idAssignatura },
        })
        .then((res) => {
          const temesRecuperats = res.data.map((tema) => ({
            value: tema.id_tema,
            label: tema.nom_tema,
            conceptes: tema.tots_els_conceptes
              ? tema.tots_els_conceptes.split(",").map((c) => c.trim())
              : [],
          }));
          setTemes(temesRecuperats);
        })
        .catch((err) => console.error("Error en recuperar els temes:", err));
    }
  }, [idAssignatura]);

  // Actualitzar conceptes en funció dels temes seleccionats
  useEffect(() => {
    // Filtrar els conceptes associats als temes seleccionats
    const nousConceptes = temesSeleccionats
      .flatMap((tema) => tema.conceptes)
      .filter((value, index, self) => self.indexOf(value) === index);

    // Actualitzar el estat dels conceptes amb els nous conceptes associats als temes seleccionats
    setConceptes(nousConceptes);

    // Filtrar els conceptes seleccionats que encara estiguin associats als temes seleccionats
    const conceptesFiltrats = conceptesSeleccionats.filter((concepte) =>
      nousConceptes.includes(concepte.value)
    );

    // Actualitzar els conceptes seleccionats, només aquells que encara estiguin disponibles
    setConceptesSeleccionats(conceptesFiltrats);
  }, [temesSeleccionats]);

  // Enviar formulari
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar que sempre hi hagi un tema seleccionat
    if (temesSeleccionats.length === 0) {
      setErrorFormulari("Selecciona almenys un tema.");
      return;
    }

    setErrorFormulari("");
    const parametersTest = {
      temes: temesSeleccionats.map((tema) => tema.value),
      conceptes: conceptesSeleccionats.map((concepte) => concepte.value),
      idAssignatura,
    };

    navigate("/testlayout", { state: { parametersTest } });
  };

  const handleTestIA = () => {
    navigate("/testIA", { state: { idAssignatura } });
  };

  return (
    <div className={styles.quizzContainerTitle}>
      <h1 className={styles.titleGenerator}>GENERADOR DE TESTS</h1>
      <div className={styles.quizzContainerBody}>
        <form className={styles.formRandom} onSubmit={handleSubmit}>
          <div className={styles.parametersQuizz}>
            <label htmlFor="temes">Tema:</label>
            <Select
              id="temes"
              name="temes"
              options={temes}
              isMulti
              onChange={(seleccionats) =>
                setTemesSeleccionats(seleccionats || [])
              }
              className={styles.select}
              placeholder="Selecciona un tema"
            />

            <label htmlFor="conceptes">Conceptes:</label>
            <Select
              id="conceptes"
              name="conceptes"
              options={conceptes.map((c) => ({ value: c, label: c }))}
              isMulti
              onChange={(seleccionats) =>
                setConceptesSeleccionats(seleccionats || [])
              }
              value={conceptesSeleccionats}
              className={styles.select}
              placeholder="Selecciona un concepte"
              isDisabled={
                temesSeleccionats.length === 0 || conceptes.length === 0
              }
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
