import React from "react";
import styles from "./Elements.module.css";
import { useNavigate } from "react-router-dom";

function ElementsPreguntes() {
  const navigate = useNavigate();

  const handleButton = () => {
    navigate("/afegirPregunta");
  };

  return (
    <div>
      <div className={styles.contentQuestion}>
        <button className={styles.addQuestion} onClick={handleButton}>
          Afegir Pregunta
        </button>
      </div>
    </div>
  );
}

export default ElementsPreguntes;
