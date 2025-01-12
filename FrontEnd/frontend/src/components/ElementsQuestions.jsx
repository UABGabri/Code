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
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [questionIdToAct, setQuestionIdToAct] = useState(null);
  const navigate = useNavigate();

  const [numberQuestionsPendent, setNumberQuestionsPendent] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const [filterText, setFilterText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/pendentQuestions", { params: { Id_User } })
      .then((res) => {
        if (res.status === 200) {
          setNumberQuestionsPendent(parseInt(res.data.count));
        }
      })
      .catch((err) => console.error("Error a la sol·licitud:", err));
  }, [Id_User]);

  const handleButton = () => {
    if (numberQuestionsPendent >= 3) {
      alert("No pots navegar perquè tens 3 o més preguntes pendents.");
    } else {
      navigate("/addQuestion", { state: { Id_User, Id_Assignatura } });
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverQuestions", {
        params: { Id_Assignatura },
      })
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("Error a la sol·licitud:", err));
  }, [Id_Assignatura]);

  const handleFilterChange = (e) => {
    setFilterText(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setCurrentPage(1);
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.pregunta.toLowerCase().includes(filterText) &&
      (selectedTopic ? q.nom_tema === selectedTopic : true)
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

  const handleEdit = (question) => {
    setEditingQuestionId(question.id_pregunta);
    setEditedQuestion({
      pregunta: question.pregunta,
      solucio_correcta: question.solucio_correcta,
    });
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
        setEditingQuestionId(null);
      })
      .catch((err) => console.error("Error actualitzant la pregunta:", err));
  };

  const handleCancel = () => {
    setEditingQuestionId(null);
    setEditedQuestion({});
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

      <div className={styles.filterContainer}>
        <label style={{ marginLeft: "10px", marginRight: "10px" }}>
          Filtrar preguntes:{" "}
        </label>
        <input
          type="text"
          placeholder="Filtrar preguntes..."
          value={filterText}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <label style={{ marginLeft: "10px", marginRight: "10px" }}>
          Filtrar per Tema:{" "}
        </label>
        <select
          value={selectedTopic}
          onChange={handleTopicChange}
          className={styles.filterInput}
        >
          <option value="">Tots els temes</option>
          {Array.from(new Set(questions.map((q) => q.nom_tema))).map((tema) => (
            <option key={tema} value={tema}>
              {tema}
            </option>
          ))}
        </select>
      </div>

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
              {editingQuestionId === question.id_pregunta ? (
                <>
                  <p>
                    <strong>Pregunta:</strong>
                    <input
                      type="text"
                      value={editedQuestion.pregunta}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          pregunta: e.target.value,
                        })
                      }
                      className={styles.editInput}
                    />
                  </p>
                  <p>
                    <strong>Resposta:</strong>
                    <input
                      type="text"
                      value={editedQuestion.solucio_correcta}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          solucio_correcta: e.target.value,
                        })
                      }
                      className={styles.editInput}
                    />
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Pregunta:</strong> {question.pregunta}
                  </p>
                  <p>
                    <strong>Resposta:</strong> {question.solucio_correcta}
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
    </div>
  );
}

ElementsQuestions.propTypes = {
  Id_User: PropTypes.number.isRequired,
  Id_Assignatura: PropTypes.string.isRequired,
  Role_User: PropTypes.string.isRequired,
};

export default ElementsQuestions;
