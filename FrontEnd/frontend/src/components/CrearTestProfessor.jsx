import styles from "./StyleComponents/Elements.module.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import { BiArrowBack } from "react-icons/bi";

//Desde elements curs va aquí per crear el test amb clau.
function CrearTestProfessor() {
  const location = useLocation();
  const idTema = location.state?.idTema;
  const idProfessor = location.state?.id_professor;
  const idAssignatura = location.state?.id_assignatura;
  const tipus = location.state?.tipus;

  const [preguntes, setPreguntes] = useState([]);
  const [filteredPreguntes, setFilteredPreguntes] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filters, setFilters] = useState({ dificultat: "", nom_tema: "" });
  const history = useNavigate();
  /*
  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverPreguntesTema", {
        params: { id_tema: idTema },
      })
      .then((response) => {
        setPreguntes(response.data);
        setFilteredPreguntes(response.data);
      })
      .catch((error) => {
        console.error("Error al recuperar les preguntes:", error);
        alert("Error al recuperar les preguntes.");
      });
  }, []);*/

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverPreguntes")
      .then((response) => {
        setPreguntes(response.data);
        setFilteredPreguntes(response.data);
        console.log(response.data);
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

    const testName = prompt("Introdueix el nom del test:");
    if (!testName) {
      alert("Has de proporcionar un nom per al test.");
      return;
    }

    let endDate;
    while (true) {
      endDate = prompt(
        "Introdueix la data de finalització del test (format YYYY-MM-DD):"
      );
      if (!endDate) {
        alert("Has de proporcionar una data de finalització.");
        continue;
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Validar formato YYYY-MM-DD
      if (!dateRegex.test(endDate)) {
        alert(
          "Format de data incorrecte. Assegura't d'introduir la data en format YYYY-MM-DD."
        );
        continue;
      }
      break; // Salir del bucle si el formato es correcto
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
        data_finalitzacio: endDate,
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
            history(-1);
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

  const handleRandomSelection = () => {
    const availableQuestions = preguntes.filter(
      (q) => !selectedQuestions.includes(q.id_pregunta)
    );
    const randomQuestions = availableQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    setSelectedQuestions((prevSelected) => [
      ...prevSelected,
      ...randomQuestions.map((q) => q.id_pregunta),
    ]);
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
  }, [filters, preguntes]);

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack onClick={() => history(-1)} className={styles.backArrow} />
      </header>

      <div className={styles.questionsContainerTeacher}>
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
          <button onClick={handleResetFilters}>Resetear filtres</button>
        </div>
        <button
          className={styles.createTestButton}
          onClick={handleCreateTest}
          disabled={selectedQuestions.length < 1}
        >
          Crear Test
        </button>
        <button
          className={styles.randomSelectButton}
          onClick={handleRandomSelection}
        >
          Selecciona 5 preguntes aleatòries
        </button>

        <button>Crear Test Intel·ligent</button>
        <div className={styles.questionsList}>
          {filteredPreguntes.length === 0 ? (
            <p>No hi ha preguntes disponibles segons els filtres.</p>
          ) : (
            filteredPreguntes.map((question) => (
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
      </div>
    </div>
  );
}

export default CrearTestProfessor;
