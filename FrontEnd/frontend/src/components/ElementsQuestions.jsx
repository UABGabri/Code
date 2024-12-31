import { useEffect, useState } from "react";
import styles from "./StyleComponents/Elements.module.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";

function ElementsQuestions({ Id_User, Id_Assignatura, Role_User }) {
  const [questions, setQuestions] = useState([]);

  const navigate = useNavigate();

  //Funció que navega a la secció d'afegir pregunta amb els elements necessaris
  const handleButton = () => {
    navigate("/addQuestion", {
      state: { Id_User, Id_Assignatura },
    });
  };

  //Funció que recupera totes les preguntes pendents d'avaluació
  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverQuestions", {
        params: { Id_Assignatura },
      })
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  }, [Id_Assignatura]);

  //Funció que actualitza l'estat de les preguntes a 'Acceptada'
  const handleStatusChange = (idPregunta, nouEstat) => {
    axios
      .put("http://localhost:8081/updateQuestionAccept", {
        id_pregunta: idPregunta,
        estat: nouEstat,
      })
      .then(() => {
        axios
          .get("http://localhost:8081/recoverQuestions", {
            params: { Id_Assignatura },
          })
          .then((res) => {
            setQuestions(res.data);
          })
          .catch((err) => {
            console.error("Error a la sol·licitud:", err);
          });
      })
      .catch((err) => {
        console.error("Error actualitzant l'estat:", err);
      });
  };

  //Funció que elimina les preguntes no necessàries
  const handleDelete = (idPregunta) => {
    axios
      .delete("http://localhost:8081/deleteQuestion", {
        params: { idPregunta },
      })
      .then((res) => {
        setQuestions((prevQuestions) =>
          prevQuestions.filter(
            (question) => question.id_pregunta !== idPregunta
          )
        );
      })
      .catch((err) => {
        console.error("Error en eliminar la pregunta:", err);
      });
  };

  return (
    <div className={styles.questionsContainer}>
      <strong className={styles.elementsCursHeader}>
        QUESTIONS MANAGEMENT
      </strong>
      <div className={styles.questionsList}>
        {questions.map((question) => (
          <div key={question.id_pregunta} className={styles.questionCard}>
            <div className={styles.questionDetails}>
              <p>
                <strong>Author:</strong> {question.id_creador}
              </p>
              <p>
                <strong>Topic:</strong> {question.nom_tema}
              </p>
              <p>
                <strong>Dificulty:</strong> {question.dificultat}
              </p>
              <p>
                <strong>Question:</strong> {question.pregunta}
              </p>
              <p>
                <strong>Answer:</strong> {question.solucio_correcta}
              </p>
            </div>

            {Role_User !== "alumne" && (
              <div className={styles.actionButtonsContainer}>
                <button
                  className={styles.acceptButton}
                  onClick={() =>
                    handleStatusChange(question.id_pregunta, "acceptada")
                  }
                >
                  <FaCheck />
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(question.id_pregunta)}
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.addQuestionButtonContainer}>
        <button className={styles.addQuestionButton} onClick={handleButton}>
          Add Question
        </button>
      </div>
    </div>
  );
}

ElementsQuestions.propTypes = {
  Id_User: PropTypes.number.isRequired,
  Id_Assignatura: PropTypes.string.isRequired,
  Role_User: PropTypes.string.isRequired,
};

export default ElementsQuestions;
