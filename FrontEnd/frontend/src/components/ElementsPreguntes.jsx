import React from "react";
import styles from "./Elements.module.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function ElementsPreguntes({ professorId, idAssignatura }) {
  const navigate = useNavigate();

  const handleButton = () => {
    navigate("/afegirPregunta", { state: { professorId, idAssignatura } });
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

ElementsPreguntes.propTypes = {
  professorId: PropTypes.number.isRequired,
  idAssignatura: PropTypes.number.isRequired,
};

export default ElementsPreguntes;
