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
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "delete" o "accept"
  const [questionIdToAct, setQuestionIdToAct] = useState(null);
  const navigate = useNavigate();

  const [numberQuestionsPendent, setNumberQuestionsPendent] = useState(0); // Inicializar como número

  useEffect(() => {
    axios
      .get("http://localhost:8081/pendentQuestions", {
        params: { Id_User },
      })
      .then((res) => {
        if (res.status === 200) {
          const count = parseInt(res.data.count);

          setNumberQuestionsPendent(count);
        }
      })
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  }, [Id_Assignatura]);

  const handleButton = () => {
    if (numberQuestionsPendent >= 3) {
      alert("No pots navegar perquè tens 3 o més preguntes pendents.");
    } else {
      navigate("/addQuestion", {
        state: { Id_User, Id_Assignatura },
      });
    }
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

  // Funció per obrir el modal de confirmació
  const handleOpenModal = (action, idPregunta) => {
    setActionType(action);
    setQuestionIdToAct(idPregunta);
    setShowModal(true);
  };

  // Funció per tancar el modal de confirmació
  const handleCloseModal = () => {
    setShowModal(false);
    setActionType("");
    setQuestionIdToAct(null);
  };

  // Funció que confirma l'acció
  const handleConfirmAction = () => {
    if (actionType === "delete" && questionIdToAct) {
      handleDelete(questionIdToAct);
    } else if (actionType === "accept" && questionIdToAct) {
      handleStatusChange(questionIdToAct, "acceptada");
    }
    handleCloseModal();
  };

  return (
    <div className={styles.questionsContainer}>
      <strong className={styles.elementsCursHeader}>GESTIÓ DE PREGUNTES</strong>
      <div className={styles.questionsList}>
        {questions.map((question) => (
          <div key={question.id_pregunta} className={styles.questionCard}>
            <div className={styles.questionDetails}>
              <p>
                <strong>Autor:</strong> {question.id_creador}
              </p>
              <p>
                <strong>Tema:</strong> {question.nom_tema}
              </p>
              <p>
                <strong>Dificultat:</strong> {question.dificultat}
              </p>
              {editingQuestionId === question.id_pregunta ? (
                <>
                  <p>
                    <strong>Pregunta:</strong>
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
                    <strong>Resposta:</strong>
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
                    <strong>Pregunta: </strong> {question.pregunta}
                  </p>
                  <p>
                    <strong className={styles.editInput}>Resposta:</strong>{" "}
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
                      className={styles.acceptButton}
                      onClick={() =>
                        handleOpenModal("accept", question.id_pregunta)
                      }
                    >
                      <FaCheck />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() =>
                        handleOpenModal("delete", question.id_pregunta)
                      }
                    >
                      <FaTimes />
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
          Afegir Pregunta
        </button>
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>
              Segur que vols {actionType === "delete" ? "esborrar" : "acceptar"}{" "}
              aquesta pregunta?
            </h3>
            <div className={styles.modalActions}>
              <button onClick={handleConfirmAction}>Si</button>
              <button onClick={handleCloseModal}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ElementsQuestions.propTypes = {
  Id_User: PropTypes.number.isRequired,
  Id_Assignatura: PropTypes.string.isRequired,
  Role_User: PropTypes.string.isRequired,
};

export default ElementsQuestions;
