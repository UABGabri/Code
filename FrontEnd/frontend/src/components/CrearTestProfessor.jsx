import styles from "./StyleComponents/Elements.module.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import { BiArrowBack } from "react-icons/bi";

function CrearTestProfessor() {
  const location = useLocation();
  const idTema = location.state?.id_tema;
  const idProfessor = location.state?.id_professor;
  const idAssignatura = location.state?.id_assignatura;
  const tipus = location.state?.tipus;
  const [preguntes, setPreguntes] = useState([]);
  const [filteredPreguntes, setFilteredPreguntes] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filters, setFilters] = useState({ dificultat: "", nom_tema: "" });
  const [dataFinalitzacio, setDataFinalitzacio] = useState("");
  const [testName, setTestName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverPreguntes")
      .then((response) => {
        setPreguntes(response.data);
        setFilteredPreguntes(response.data);
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

    if (!testName) {
      alert("Has de proporcionar un nom per al test.");
      return;
    }

    if (!dataFinalitzacio) {
      alert("Has de proporcionar una data de finalització.");
      return;
    }

    const id_creador = idProfessor;
    const id_assignatura = idAssignatura;

    axios
      .post("http://localhost:8081/createTest", {
        nom_test: testName,
        id_creador,
        id_assignatura,
        idTema,
        tipus,
        data_finalitzacio: dataFinalitzacio,
      })
      .then((response) => {
        alert("Test creat correctament!");
        const idTest = parseInt(response.data.id_test);

        const orderedQuestions = selectedQuestions.map(
          (id_pregunta, index) => ({
            id_pregunta,
            posicio: index + 1,
          })
        );

        axios
          .post("http://localhost:8081/insertQuestionsTest", {
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
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleResetFilters = () => {
    setFilters({ dificultat: "", nom_tema: "" });
    setFilteredPreguntes(preguntes);
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

  // Caniv pàgina
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
          <select
            value={filters.dificultat}
            onChange={(e) => handleFilterChange("dificultat", e.target.value)}
          >
            <option value="">Filtrar per dificultat</option>
            <option value="Fàcil">Fàcil</option>
            <option value="Mitjà">Mitjà</option>
            <option value="Difícil">Difícil</option>
          </select>
          <input
            type="text"
            placeholder="Filtrar per tema"
            value={filters.nom_tema}
            onChange={(e) => handleFilterChange("nom_tema", e.target.value)}
          />
          <button onClick={handleResetFilters}>Reseteig filtres</button>
        </div>

        <div className={styles.testDetails}>
          <label>
            Nom del Test:
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </label>
          <label>
            Data de Finalització:
            <input
              type="date"
              value={dataFinalitzacio}
              onChange={(e) => setDataFinalitzacio(e.target.value)}
            />
          </label>
        </div>

        <button
          className={styles.createTestButton}
          onClick={handleCreateTest}
          disabled={selectedQuestions.length < 1}
        >
          Crear Test
        </button>

        <div className={styles.questionsList}>
          {currentQuestions.length === 0 ? (
            <p>No hi ha preguntes disponibles segons els filtres.</p>
          ) : (
            currentQuestions.map((question) => (
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
          >
            Anterior
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
          >
            Següent
          </button>
        </div>
      </div>
    </div>
  );
}

export default CrearTestProfessor;
