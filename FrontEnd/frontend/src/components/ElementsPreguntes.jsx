import React, { useEffect } from "react";
import styles from "./Elements.module.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";

function ElementsPreguntes({ professorId, idAssignatura }) {
  const navigate = useNavigate();

  const handleButton = () => {
    navigate("/afegirPregunta", { state: { professorId, idAssignatura } });
  };

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverQuestions", {
        params: { idAssignatura },
      })
      .then((res) => {
        console.log("Resposta del servidor:", res.data);
        console.log(idAssignatura);
      })
      .catch((err) => {
        console.error("Error a la solicitud:", err);
      });
  });

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
  idAssignatura: PropTypes.string.isRequired,
};

export default ElementsPreguntes;
