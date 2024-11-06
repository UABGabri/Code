import React, { useState } from "react";
import styles from "./AfegirPregunta.module.css";
import Headercap from "./Headercap";

function AfegirPregunta() {
  const [values, setValues] = useState({
    tema: "",
    conceptes: "",
    dificultat: "",
    pregunta: "",
    solucio: "",
    erronea_1: "",
    erronea_2: "",
    erronea_3: "",
    erronea_4: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(values);
  };

  return (
    <div className={styles.content}>
      <Headercap />
      <h1>AFEGIR PREGUNTA</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="tema">Tema:</label>
          <input
            type="text"
            id="tema"
            name="tema"
            value={values.tema}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="conceptes">Conceptes:</label>
          <input
            type="text"
            id="conceptes"
            name="conceptes"
            value={values.conceptes}
            onChange={handleChange}
            placeholder="Conceptes separats per comes"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dificultat">Dificultat:</label>
          <select
            id="dificultat"
            name="dificultat"
            value={values.dificultat}
            onChange={handleChange}
          >
            <option value="">Selecciona</option>
            <option value="Fàcil">Fàcil</option>
            <option value="Mitjà">Mitjà</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="pregunta">Pregunta:</label>
          <textarea
            id="pregunta"
            name="pregunta"
            value={values.pregunta}
            onChange={handleChange}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="solucio">Solució Correcta:</label>
          <input
            type="text"
            id="solucio"
            name="solucio"
            value={values.solucio}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="erronea_1">Solució Incorrecta 1:</label>
          <input
            type="text"
            id="erronea_1"
            name="erronea_1"
            value={values.erronea_1}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="erronea_2">Solució Incorrecta 2:</label>
          <input
            type="text"
            id="erronea_2"
            name="erronea_2"
            value={values.erronea_2}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="erronea_3">Solució Incorrecta 3:</label>
          <input
            type="text"
            id="erronea_3"
            name="erronea_3"
            value={values.erronea_3}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="erronea_4">Solució Incorrecta 4:</label>
          <input
            type="text"
            id="erronea_4"
            name="erronea_4"
            value={values.erronea_4}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className={styles.sendButton}>
          AFEGIR
        </button>
      </form>
    </div>
  );
}

export default AfegirPregunta;
