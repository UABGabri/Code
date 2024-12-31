import { useEffect, useState } from "react";
import styles from "./StyleComponents/Elements.module.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { FaCheck, FaTimes, FaEdit, FaSave } from "react-icons/fa";

function ElementsQuestions({ Id_User, Id_Assignatura, Role_User }) {
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});

  const navigate = useNavigate();

  // Funció que navega a la secció d'afegir pregunta amb els elements necessaris
  const handleButton = () => {
    navigate("/addQuestion", {
      state: { Id_User, Id_Assignatura },
    });
  };

  // Funció que recupera totes les preguntes pendents d'avaluació
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

  // Funció que inicia el mode d'edició
  const handleEdit = (question) => {
    setEditingQuestionId(question.id_pregunta);
    setEditedQuestion({
      pregunta: question.pregunta,
      solucio_correcta: question.solucio_correcta,
    });
  };

  // Funció que gestiona els canvis a l'entrada
  const handleInputChange = (field, value) => {
    setEditedQuestion((prev) => ({ ...prev, [field]: value }));
  };

  // Funció per guardar els canvis
  const handleSave = (idPregunta) => {
    // Validació dels camps
    if (
      !editedQuestion.pregunta.trim() ||
      !editedQuestion.solucio_correcta.trim()
    ) {
      alert("Both question and answer are required.");
      return;
    }

    axios
      .put("http://localhost:8081/updateQuestion", {
        id_pregunta: idPregunta,
        pregunta: editedQuestion.pregunta,
        solucio_correcta: editedQuestion.solucio_correcta,
        Id_Assignatura,
      })
      .then(() => {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id_pregunta === idPregunta ? { ...q, ...editedQuestion } : q
          )
        );
        setEditingQuestionId(null);
      })
      .catch((err) => {
        console.error("Error actualitzant la pregunta:", err);
      });
  };

  // Funció per cancel·lar l'edició
  const handleCancel = () => {
    setEditingQuestionId(null);
    setEditedQuestion({});
  };

  // Funció que actualitza l'estat de les preguntes a 'Acceptada'
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

  // Funció que elimina les preguntes no necessàries
  const handleDelete = (idPregunta) => {
    axios
      .delete("http://localhost:8081/deleteQuestion", {
        params: { idPregunta },
      })
      .then(() => {
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
                <strong>Difficulty:</strong> {question.dificultat}
              </p>
              {editingQuestionId === question.id_pregunta ? (
                <>
                  <p>
                    <strong>Question:</strong>
                    <input
                      type="text"
                      value={editedQuestion.pregunta}
                      onChange={(e) =>
                        handleInputChange("pregunta", e.target.value)
                      }
                      className={styles.editInput}
                      required
                    />
                  </p>
                  <p>
                    <strong>Answer:</strong>
                    <input
                      type="text"
                      value={editedQuestion.solucio_correcta}
                      onChange={(e) =>
                        handleInputChange("solucio_correcta", e.target.value)
                      }
                      className={styles.editInput}
                    />
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.editInput}>
                    <strong>Question: </strong> {question.pregunta}
                  </p>
                  <p>
                    <strong className={styles.editInput}>Answer:</strong>{" "}
                    {question.solucio_correcta}
                  </p>
                </>
              )}
            </div>

            {Role_User !== "alumne" && (
              <div className={styles.actionButtonsContainer}>
                {editingQuestionId === question.id_pregunta ? (
                  <>
                    <button
                      className={styles.saveButton}
                      onClick={() => handleSave(question.id_pregunta)}
                    >
                      <FaSave />
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={handleCancel}
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(question)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(question.id_pregunta)}
                    >
                      <FaTimes />
                    </button>
                    <button
                      className={styles.acceptButton}
                      onClick={() =>
                        handleStatusChange(question.id_pregunta, "acceptada")
                      }
                    >
                      <FaCheck />
                    </button>
                  </>
                )}
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
