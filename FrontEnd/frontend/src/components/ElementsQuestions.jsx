import { useEffect, useState } from "react";
import styles from "./StyleComponents/Elements.module.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import {
  FaCheck,
  FaTimes,
  FaEdit,
  FaSave,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

function ElementsQuestions({ Id_User, Id_Assignatura, Role_User }) {
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedEditingQuestion, setSelectedEditingQuestion] = useState({});
  const [editedQuestion, setEditedQuestion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [questionIdToAct, setQuestionIdToAct] = useState(null);
  const [topics, setTopics] = useState([]);

  const navigate = useNavigate();
  const [numberQuestionsPendent, setNumberQuestionsPendent] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedFilterType, setSelectedFilterType] = useState("");

  //Funció de recuperació del número de preguntes en estat pendent de l'usuari per evitar més de tres preguntes sent alumne
  useEffect(() => {
    axios
      .get("http://localhost:8081/pendentQuestions", { params: { Id_User } })
      .then((res) => {
        if (res.data.Status === "Sucess") {
          setNumberQuestionsPendent(parseInt(res.data.count));
        } else {
          alert("Error al recuperar les preguntes pendents");
        }
      })
      .catch((err) => console.error("Error a la sol·licitud:", err));
  }, [Id_User]);

  const handleButton = () => {
    if (Role_User === "alumne") {
      if (numberQuestionsPendent >= 3) {
        alert("No pots navegar perquè tens 3 o més preguntes pendents.");
      } else {
        navigate("/addQuestion", {
          state: { Id_User, Id_Assignatura, Role_User },
        });
      }
    } else {
      navigate("/addQuestion", {
        state: { Id_User, Id_Assignatura, Role_User },
      });
    }
  };

  //Funció de renderitzat de la funció.
  useEffect(() => {
    if (Role_User === "professor") {
      axios
        .get("http://localhost:8081/recoverQuestions", {
          params: { Id_Assignatura },
        })
        .then((res) => {
          if (res.data.Status === "Empty") setQuestions([]);

          if (res.data.Status === "Success") {
            setQuestions(res.data.result);
          }

          axios
            .get("http://localhost:8081/recoverTopicsSubject", {
              params: { Id_Assignatura },
            })
            .then((res) => {
              setTopics(res.data);
            });
        })
        .catch((err) => alert(err));
    } else {
      axios
        .get("http://localhost:8081/recoverQuestionsAlumni", {
          params: { Id_Assignatura, Id_User },
        })
        .then((res) => {
          setQuestions(res.data);
        })
        .catch((err) => alert(err));
    }
  }, [Id_Assignatura, questions]); //mirar les dependències

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (e) => {
    setSelectedFilterType(e.target.value);
    setCurrentPage(1);
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedTopic === "" && selectedFilterType === "") {
      return true;
    }

    if (selectedFilterType === "") {
      return q.nom_tema === selectedTopic;
    }

    if (selectedFilterType === "banc") {
      if (selectedTopic === "") {
        return q.estat === "acceptada";
      } else {
        return q.estat === "acceptada" && q.nom_tema === selectedTopic;
      }
    }

    if (selectedFilterType === "pendent") {
      if (selectedTopic === "") {
        return q.estat === "pendent";
      }

      return q.estat === "pendent" && q.nom_tema === selectedTopic;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const displayedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === -1 && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === 1 && currentPage < totalPages)
      setCurrentPage(currentPage + 1);
  };

  const handleOpenModal = (action, idPregunta) => {
    setActionType(action);
    setQuestionIdToAct(idPregunta);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActionType("");
    setQuestionIdToAct(null);
  };

  const handleConfirmAction = () => {
    if (actionType === "delete" && questionIdToAct)
      handleDelete(questionIdToAct);
    if (actionType === "accept" && questionIdToAct)
      handleStatusChange(questionIdToAct, "acceptada");
    handleCloseModal();
  };

  //Funció per obrir el modal de la edició i obtenir la seva informació
  const handleEdit = (question) => {
    setEditedQuestion(true);
    setSelectedEditingQuestion(question);
  };

  //Funció per cancel·lar la edició
  const handleCancel = () => {
    setEditingQuestion(null);
    setEditedQuestion(false);
  };

  //Funció de update de la edició -> falta repassar el id dels conceptes perquè funcioni del tot i del tema (que canvii)
  const handleSave = () => {
    axios
      .put("http://localhost:8081/updateQuestion", {
        id_pregunta: selectedEditingQuestion.id_pregunta,
        nom_tema: selectedEditingQuestion.nom_tema,
        pregunta: selectedEditingQuestion.pregunta,
        solucio_correcta: selectedEditingQuestion.solucio_correcta,
        solucio_erronia1: selectedEditingQuestion.solucio_erronia1,
        solucio_erronia2: selectedEditingQuestion.solucio_erronia2,
        solucio_erronia3: selectedEditingQuestion.solucio_erronia3,
        conceptes: selectedEditingQuestion.conceptes,
        dificultat: selectedEditingQuestion.dificultat,
        Id_Assignatura,
      })
      .then((res) => {
        if (res.data.Status === "Success") {
          alert("Canvis efectuats");

          axios
            .get("http://localhost:8081/recoverQuestions", {
              params: { Id_Assignatura },
            })
            .then((res) => {
              if (res.data.Status === "Empty") setQuestions([]);

              if (res.data.Status === "Success") {
                setQuestions(res.data.result);
              }
            })
            .catch((err) => console.error("Error a la sol·licitud:", err));
        }
      })
      .catch((err) => console.error("Error actualitzant la pregunta:", err));
  };

  //Funció d'avaluació eliminació de les preguntes
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
      .catch((err) => console.error("Error en eliminar la pregunta:", err));
  };

  //Funció d'avaluació de les preguntes
  const handleStatusChange = (idPregunta, nouEstat) => {
    console.log(idPregunta, nouEstat);
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
            if (res.data.Status === "Empty") setQuestions([]);

            if (res.data.Status === "Success") {
              setQuestions(res.data.result);
            }
          })
          .catch((err) => console.error("Error a la sol·licitud:", err));
      })
      .catch((err) => console.error("Error actualitzant l'estat:", err));
  };

  return (
    <div className={styles.questionsContainer}>
      <strong className={styles.elementsCursHeader}>GESTIÓ DE PREGUNTES</strong>
      {Role_User === "professor" && (
        <>
          <div className={styles.filterContainer}>
            <label style={{ marginLeft: "10px", marginRight: "10px" }}>
              Filtrar Preguntes per Estat:{" "}
            </label>
            <select
              value={selectedFilterType}
              onChange={handleFilterTypeChange}
              className={styles.filterInput}
            >
              <option value="">Totes les Preguntes</option>
              <option value="banc">Acceptades</option>
              <option value="pendent">Avaluació</option>
            </select>

            <label style={{ marginLeft: "10px", marginRight: "10px" }}>
              Filtrar per Tema:{" "}
            </label>
            <select
              value={selectedTopic}
              onChange={handleTopicChange}
              className={styles.filterInput}
            >
              <option value="">Tots els temes</option>

              {Array.from(new Set(questions.map((q) => q.nom_tema)))
                .sort()
                .map((tema) => (
                  <option key={tema} value={tema}>
                    {tema}
                  </option>
                ))}
            </select>
          </div>
        </>
      )}
      <div className={styles.questionsList}>
        {displayedQuestions.length > 0 ? (
          displayedQuestions.map((question) => (
            <div key={question.id_pregunta} className={styles.questionCard}>
              <div className={styles.questionDetails}>
                <p>
                  <strong>Tema:</strong> {question.nom_tema || "No té tema"}
                </p>
                <p>
                  <strong>Dificultat:</strong>{" "}
                  {question.dificultat || "No té dificultat"}
                </p>
                <p>
                  <strong>Pregunta:</strong>{" "}
                  {question.pregunta || "No té pregunta"}
                </p>
                <p>
                  <strong>Resposta:</strong>{" "}
                  {question.solucio_correcta || "No té resposta"}
                </p>
              </div>

              {Role_User !== "alumne" && (
                <div className={styles.actionButtonsContainer}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(question)}
                  >
                    <FaEdit />
                  </button>

                  <button
                    className={styles.deleteButton}
                    onClick={() =>
                      handleOpenModal("delete", question.id_pregunta)
                    }
                  >
                    <FaTimes />
                  </button>

                  {question.estat === "pendent" && (
                    <>
                      <button
                        className={styles.acceptButton}
                        onClick={() =>
                          handleOpenModal("accept", question.id_pregunta)
                        }
                      >
                        <FaCheck />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noAtendeesMessage}>
            <strong style={{ color: "red" }}>Sense Preguntes </strong>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
            style={{ background: "none" }}
          >
            <FaArrowLeft />
          </button>
          <span style={{ marginBottom: "10px" }}>
            Pàgina {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
            style={{ background: "none" }}
          >
            <FaArrowRight />
          </button>
        </div>
      )}

      <button
        className={styles.addQuestionButton}
        onClick={handleButton}
        style={{ marginBottom: "10px" }}
      >
        Afegeix Pregunta
      </button>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>
              Estàs segur que vols{" "}
              {actionType === "delete" ? "eliminar" : "acceptar"} aquesta
              pregunta?
            </p>
            <div className={styles.modalButtons}>
              <button
                onClick={handleConfirmAction}
                className={styles.confirmButton}
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={styles.cancelButton}
              >
                Cancel·lar
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Edició de les preguntes*/}
      {editedQuestion && (
        <>
          <div className={styles.editionMode}>
            <div className={styles.editionContent}>
              <h1>Editar Pregunta</h1>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <p>
                  <strong>Tema:</strong>{" "}
                </p>
                <select
                  className={styles.filterInput}
                  value={selectedEditingQuestion.nom_tema}
                  onChange={(e) =>
                    setSelectedEditingQuestion({
                      ...selectedEditingQuestion,
                      nom_tema: e.target.value,
                    })
                  }
                  placeholder="Selecciona un tema"
                  required
                >
                  {topics.map((tema) => (
                    <option key={tema.id_tema} value={tema.nom_tema}>
                      {tema.nom_tema}
                    </option>
                  ))}
                </select>

                <p>
                  <strong>Conceptes:</strong>
                </p>
                <input
                  type="text"
                  value={selectedEditingQuestion.conceptes}
                  onChange={(e) =>
                    setSelectedEditingQuestion({
                      ...selectedEditingQuestion,
                      conceptes: e.target.value,
                    })
                  }
                  placeholder="Conceptes separats per comes"
                  required
                  pattern="^[A-Za-zÀ-ÿ0-9\s,]+$"
                  maxLength={30}
                  className={styles.editInput}
                />

                <p>
                  <strong>Dificultat:</strong>{" "}
                </p>
                <select
                  value={selectedEditingQuestion.dificultat}
                  onChange={(e) =>
                    setSelectedEditingQuestion({
                      ...selectedEditingQuestion,
                      dificultat: e.target.value,
                    })
                  }
                  required
                >
                  <option>Fàcil</option>
                  <option>Mitjà</option>
                  <option>Difícil</option>
                </select>

                <p>
                  <strong>Pregunta:</strong>{" "}
                </p>
                <input
                  type="text"
                  value={selectedEditingQuestion.pregunta}
                  onChange={(e) =>
                    setSelectedEditingQuestion({
                      ...selectedEditingQuestion,
                      pregunta: e.target.value,
                    })
                  }
                  className={styles.editInput}
                  placeholder="Insereix la teva pregunta"
                  required
                  pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                  maxLength={200}
                />

                <p>
                  <strong>Resposta Correcta:</strong>{" "}
                </p>
                <input
                  type="text"
                  value={selectedEditingQuestion.solucio_correcta}
                  onChange={(e) =>
                    setSelectedEditingQuestion({
                      ...selectedEditingQuestion,
                      solucio_correcta: e.target.value,
                    })
                  }
                  placeholder="Solució correcta"
                  required
                  pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                  maxLength={30}
                  className={styles.selectInput}
                />

                <p>
                  <strong>Resposta Incorrecta:</strong>
                </p>
                <input
                  type="text"
                  value={selectedEditingQuestion.solucio_erronia1}
                  onChange={(e) =>
                    setSelectedEditingQuestion({
                      ...selectedEditingQuestion,
                      solucio_erronia1: e.target.value,
                    })
                  }
                  className={styles.editInput}
                  pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                  placeholder="Solució erronea"
                  maxLength={30}
                />

                <p>
                  <strong>Resposta Incorrecta 2:</strong>
                </p>
                <input
                  type="text"
                  value={selectedEditingQuestion.solucio_erronia2}
                  onChange={(e) =>
                    setSelectedEditingQuestion({
                      ...selectedEditingQuestion,
                      solucio_erronia2: e.target.value,
                    })
                  }
                  className={styles.editInput}
                  pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                  placeholder="Solució erronea"
                  maxLength={30}
                />

                <p>
                  <strong>Resposta Incorrecta 3:</strong>{" "}
                </p>
                <input
                  type="text"
                  value={selectedEditingQuestion.solucio_erronia3}
                  onChange={(e) =>
                    setSelectedEditingQuestion({
                      ...selectedEditingQuestion,
                      solucio_erronia3: e.target.value,
                    })
                  }
                  className={styles.editInput}
                  pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                  placeholder="Solució erronea"
                  maxLength={30}
                />

                <div>
                  <button type="submit" className={styles.acceptButton}>
                    Guardar
                  </button>{" "}
                  <button
                    type="button"
                    onClick={() => handleCancel()}
                    className={styles.deleteButton}
                  >
                    Cancel·lar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
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
