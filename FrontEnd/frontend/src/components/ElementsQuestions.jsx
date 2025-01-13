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

  const navigate = useNavigate();
  const [numberQuestionsPendent, setNumberQuestionsPendent] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filterText, setFilterText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedFilterType, setSelectedFilterType] = useState("");

  //Funció de recuperació del número de preguntes en estat pendent de l'usuari
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

  useEffect(() => {
    if (Role_User === "professor") {
      axios
        .get("http://localhost:8081/recoverQuestions", {
          params: { Id_Assignatura },
        })
        .then((res) => {
          setQuestions(res.data);
        })
        .catch((err) => console.error("Error a la sol·licitud:", err));
    } else {
      axios
        .get("http://localhost:8081/recoverQuestionsAlumni", {
          params: { Id_Assignatura, Id_User },
        })
        .then((res) => {
          setQuestions(res.data);
        })
        .catch((err) => console.error("Error a la sol·licitud:", err));
    }
  }, [Id_Assignatura]);

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (e) => {
    setSelectedFilterType(e.target.value);
    setCurrentPage(1);
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.pregunta.toLowerCase().includes(filterText) &&
      (selectedTopic ? q.nom_tema === selectedTopic : true) &&
      (selectedFilterType
        ? selectedFilterType === "banc"
          ? q.estat === "acceptada"
          : q.estat === "pendent"
        : true)
  );

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
    console.log(question);
    setSelectedEditingQuestion(question);
  };

  //Funció per cancel·lar la edició
  const handleCancel = () => {
    setEditingQuestion(null);
    setEditedQuestion({});
  };

  const handleSave = (idPregunta) => {
    if (
      !editedQuestion.pregunta.trim() ||
      !editedQuestion.solucio_correcta.trim()
    ) {
      alert("Tant la pregunta com la resposta són obligatoris.");
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
        setEditingQuestion(null);
      })
      .catch((err) => console.error("Error actualitzant la pregunta:", err));
  };

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
          .then((res) => setQuestions(res.data))
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
              <option value="banc">Banc de Preguntes</option>
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
              {Array.from(new Set(questions.map((q) => q.nom_tema))).map(
                (tema) => (
                  <option key={tema} value={tema}>
                    {tema}
                  </option>
                )
              )}
            </select>
          </div>
        </>
      )}
      <div className={styles.questionsList}>
        {displayedQuestions.map((question) => (
          <div key={question.id_pregunta} className={styles.questionCard}>
            <div className={styles.questionDetails}>
              <p>
                <strong>Tema:</strong> {question.nom_tema}
              </p>
              <p>
                <strong>Dificultat:</strong> {question.dificultat}
              </p>
              <p>
                <strong>Pregunta:</strong> {question.pregunta}
              </p>
              <p>
                <strong>Resposta:</strong> {question.solucio_correcta}
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
      <button className={styles.addQuestionButton} onClick={handleButton}>
        Afegeix Pregunta
      </button>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>
              Estàs segur que vols{" "}
              {actionType === "delete" ? "eliminar" : "acceptar"}
              aquesta pregunta?
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

      {editedQuestion && (
        <>
          <div className={styles.editionMode}>
            <div className={styles.editionContent}>
              <h1>Editar Pregunta</h1>

              <p>
                <strong>Tema:</strong>{" "}
              </p>

              <input
                type="text"
                value={selectedEditingQuestion.nom_tema}
                onChange={(e) =>
                  setSelectedEditingQuestion({
                    ...selectedEditingQuestion,
                    nom_tema: e.target.value,
                  })
                }
                className={styles.editInput}
              />

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
                className={styles.editInput}
              />

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
              />

              <p>
                <strong>Dificultat:</strong>{" "}
              </p>

              <select>
                <option>Fàcil</option>
                <option>Mitjà</option>
                <option>Difícil</option>
              </select>
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
                className={styles.editInput}
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
              />

              <div>
                <button
                  onClick={() =>
                    handleSave(selectedEditingQuestion.id_pregunta)
                  }
                >
                  Guardar
                </button>
                <button onClick={() => setEditedQuestion(false)}>
                  Cancel·lar
                </button>
              </div>
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
