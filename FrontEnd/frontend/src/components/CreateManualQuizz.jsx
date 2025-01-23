import styles from "./StyleComponents/CreateQuizzManual.module.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import { BiArrowBack } from "react-icons/bi";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

const apiUrl = import.meta.env.VITE_API_URL;

function CreateManualQuizz() {
  const location = useLocation();
  const idTema = location.state?.id_tema;
  const idProfessor = location.state?.id_professor;
  const idAssignatura = location.state?.id_assignatura;
  const tipus = location.state?.tipus;

  const [preguntes, setPreguntes] = useState([]);
  const [filteredPreguntes, setFilteredPreguntes] = useState([]);
  const [temesFilters, setTemesFilters] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filters, setFilters] = useState({ dificultat: "", nom_tema: "" });
  const [dataFinalitzacio, setDataFinalitzacio] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const navigate = useNavigate();
  const [isFinalModal, setIsFinalModalOpen] = useState(false);
  const [nomTest, setNomTest] = useState("");
  const [duracio, setDuracio] = useState("");
  const [clau, setClau] = useState("");
  const [intents, setIntents] = useState("");

  useEffect(() => {
    axios
      .get(`${apiUrl}/recoverPreguntes`, {
        params: { idAssignatura },
      })
      .then((response) => {
        setPreguntes(response.data);
        setFilteredPreguntes(response.data);

        console.log(response);

        const id_assignatura = idAssignatura;
        axios
          .get(`${apiUrl}/recoverTopicsSubject`, {
            params: { Id_Assignatura: id_assignatura },
          })
          .then((response) => setTemesFilters(response.data))
          .catch((error) => console.error("Error al recuperar temes:", error));
      })
      .catch((error) => {
        console.error("Error al recuperar les preguntes:", error);
        alert("Error al recuperar les preguntes.");
      });
  }, []);

  const handleCheckboxChange = (id_pregunta) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(id_pregunta)
        ? prevSelected.filter((id) => id !== id_pregunta)
        : [...prevSelected, id_pregunta]
    );
  };

  const handleCreateTest = () => {
    if (selectedQuestions.length < 1) {
      alert("Has de seleccionar almenys una pregunta per crear el test.");
      return;
    }

    if (!nomTest) {
      alert("Has de proporcionar un nom per al test.");
      return;
    }

    if (!dataFinalitzacio) {
      alert("Has de proporcionar una data de finalització.");
      return;
    }

    if (!duracio) {
      alert("Has de proporcionar una data de finalització.");
      return;
    }

    const id_creador = idProfessor;
    const id_assignatura = idAssignatura;

    axios
      .post(`${apiUrl}/createTest`, {
        nom_test: nomTest,
        id_creador,
        id_assignatura,
        idTema,
        tipus,
        data_finalitzacio: dataFinalitzacio,
        duracio,
        clau,
        intents,
      })
      .then((response) => {
        if (response.data.Status === "Failed") {
          alert("Error al crear");
          return;
        }

        if (tipus === "avaluatiu") {
          alert("Test creat correctament amb clau: " + clau);
        } else {
          alert("Test creat correctament!");
        }

        const idTest = parseInt(response.data.id_test);

        const orderedQuestions = selectedQuestions.map(
          (id_pregunta, index) => ({
            id_pregunta,
            posicio: index + 1,
          })
        );

        axios
          .post(`${apiUrl}/insertQuestionsTest`, {
            id_test: idTest,
            questions: orderedQuestions,
          })
          .then(() => {
            navigate(-1);
          })
          .catch((error) => {
            console.error("Error al insertar les preguntes:", error);
            alert("Error al recuperar les preguntes.");
          });
      })
      .catch((error) => {
        console.error("Error al crear el test:", error);
        alert("Hi ha hagut un error al crear el test. Torna-ho a intentar.");
      });

    setIsFinalModalOpen(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  useEffect(() => {
    const filtered = preguntes.filter((question) => {
      return (
        (filters.dificultat
          ? question.dificultat === filters.dificultat
          : true) &&
        (filters.nom_tema ? question.nom_tema === filters.nom_tema : true)
      );
    });

    setFilteredPreguntes(filtered);
    setCurrentPage(1);
  }, [filters, preguntes]);

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredPreguntes.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  // Canvi de pàgina
  const handlePageChange = (direction) => {
    if (
      direction === "next" &&
      currentPage < Math.ceil(filteredPreguntes.length / questionsPerPage)
    ) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const createQuizz = () => {
    setIsFinalModalOpen(true);
  };

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack
          onClick={() => navigate(-1)}
          className={styles.backArrow}
        />
      </header>

      <div className={styles.questionsContainerTeacher}>
        <h1>Creació Test Manual</h1>
        <div className={styles.filters}>
          <label style={{ marginRight: "10px" }}>
            Filtrar per Dificultat:{" "}
          </label>
          <select
            value={filters.dificultat}
            onChange={(e) => handleFilterChange("dificultat", e.target.value)}
            style={{ marginRight: "10px" }}
          >
            <option value="">Totes</option>
            <option value="Fàcil">Fàcil</option>
            <option value="Mitjà">Mitjà</option>
            <option value="Difícil">Difícil</option>
          </select>

          <label style={{ marginRight: "10px" }}>Filtrar per tema:</label>
          <select
            value={filters.nom_tema}
            onChange={(e) => handleFilterChange("nom_tema", e.target.value)}
          >
            <option value="">Selecciona un tema</option>
            {temesFilters.map((tema) => (
              <option key={tema.id_tema} value={tema.nom_tema}>
                {tema.nom_tema}
              </option>
            ))}
          </select>
        </div>

        {isFinalModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3 className={styles.titleGenerator}>Crear Test</h3>

              <div className={styles.modalLabels}>
                <label className={styles.inputLabel}>
                  Nom del Test:
                  <input
                    type="text"
                    className={styles.inputField}
                    value={nomTest}
                    onChange={(e) => setNomTest(e.target.value)}
                  />
                </label>

                <label className={styles.inputLabel}>
                  Data de Finalització:
                  <input
                    type="date"
                    value={dataFinalitzacio}
                    onChange={(e) => setDataFinalitzacio(e.target.value)}
                    className={styles.inputField}
                  />
                </label>

                <label className={styles.inputLabel}>
                  Duració del test:
                  <input
                    type="text"
                    value={duracio}
                    onChange={(e) => {
                      const inputValue = e.target.value;

                      if (/^\d{0,3}$/.test(inputValue)) {
                        setDuracio(inputValue * 60);
                      }
                    }}
                    className={styles.inputField}
                    placeholder="En minuts"
                  />
                </label>
                {tipus === "avaluatiu" && (
                  <>
                    <label className={styles.inputLabel}>
                      Clau:
                      <input
                        type="text"
                        value={clau}
                        onChange={(e) => {
                          setClau(e.target.value);
                        }}
                        className={styles.inputField}
                        required
                        maxLength={5}
                      />
                    </label>
                    <label className={styles.inputLabel}>
                      Intents:
                      <input
                        type="number"
                        value={intents}
                        onChange={(e) => {
                          setIntents(e.target.value);
                        }}
                        className={styles.inputField}
                        required
                        maxLength={5}
                      />
                    </label>
                  </>
                )}
              </div>

              <div>
                <button onClick={handleCreateTest} className={styles.colorButt}>
                  Crear
                </button>
                <button
                  onClick={() => setIsFinalModalOpen(false)}
                  className={styles.colorButtDel}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.questionsList}>
          {currentQuestions.length === 0 ? (
            <p>No hi ha preguntes disponibles segons els filtres.</p>
          ) : (
            currentQuestions.map((question) => (
              <div key={question.id_pregunta} className={styles.questionCard}>
                <div className={styles.questionDetails}>
                  <p>
                    <strong>Tema:</strong> {question.nom_tema}
                  </p>
                  <p>
                    <strong>Conceptes:</strong> {question.conceptes}
                  </p>
                  <p>
                    <strong>Dificultat:</strong> {question.dificultat}
                  </p>
                  <p>
                    <strong>Pregunta:</strong> {question.pregunta}
                  </p>
                  <p>
                    <strong>Solució:</strong> {question.solucio_correcta}
                  </p>
                </div>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id_pregunta)}
                    onChange={() => handleCheckboxChange(question.id_pregunta)}
                  />
                  <label>Seleccionar</label>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            style={{ background: "none", border: "none" }}
          >
            <FaArrowLeft />
          </button>
          <span>
            Pàgina {currentPage} de{" "}
            {Math.ceil(filteredPreguntes.length / questionsPerPage)}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={
              currentPage ===
              Math.ceil(filteredPreguntes.length / questionsPerPage)
            }
            style={{ background: "none", border: "none" }}
          >
            <FaArrowRight />
          </button>
        </div>

        <button
          className={styles.colorButt}
          onClick={createQuizz}
          disabled={selectedQuestions.length < 1}
        >
          Crear Test
        </button>
      </div>
    </div>
  );
}

export default CreateManualQuizz;
