import styles from "./StyleComponents/Elements.module.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import { BiArrowBack } from "react-icons/bi";

function ElementsTests({}) {
  const location = useLocation();
  const idTema = location.state?.idTema;
  const idProfessor = location.state?.id_professor;
  const idAssignatura = location.state?.id_assignatura;

  const [preguntes, setPreguntes] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const navigate = useNavigate();
  const history = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverPreguntesTema", {
        params: { id_tema: idTema },
      })
      .then((response) => {
        setPreguntes(response.data);
      })
      .catch((error) => {
        console.error("Error al recuperar les preguntes:", error);
        alert("Error al recuperar les preguntes.");
      });
  }, []);

  const handleCheckboxChange = (id_pregunta) => {
    setSelectedQuestions((prevSelected) => {
      if (prevSelected.includes(id_pregunta)) {
        return prevSelected.filter((id) => id !== id_pregunta);
      } else if (prevSelected.length < 10) {
        return [...prevSelected, id_pregunta];
      }
      return prevSelected;
    });
  };

  //Funció de creació dels tests. No encuentra el id del usuario professor. Hay que resolverlo para que pueda añadir tests, luego en then ejecutar para añadir preguntas seleccinoadas
  const handleCreateTest = () => {
    if (selectedQuestions.length < 5) {
      alert("Selecciona un mínim de 5 preguntes per crear el test.");
      return;
    }

    const testName = prompt("Introdueix el nom del test:");
    if (!testName) {
      alert("Has de proporcionar un nom per al test.");
      return;
    }

    const id_creador = idProfessor;
    const id_assignatura = idAssignatura;
    console.log(id_creador);

    axios
      .post("http://localhost:8081/createTest", {
        nom_test: testName,
        id_creador,
        id_assignatura,
        idTema,
      })
      .then((response) => {
        alert("Test creat correctament!");
        return (
          <ElementsTests
            professorId={id_creador}
            idAssignatura={id_assignatura}
          />
        );
      })
      .catch((error) => {
        console.error("Error al crear el test:", error);
        alert("Hi ha hagut un error al crear el test. Torna-ho a intentar.");
      });
  };

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack onClick={() => history(-1)} className={styles.backArrow} />
      </header>

      <div className={styles.questionsContainerTeacher}>
        <button
          className={styles.createTestButton}
          onClick={handleCreateTest}
          disabled={selectedQuestions.length < 5}
        >
          Crear Test
        </button>
        <div className={styles.questionsList}>
          {preguntes.length === 0 ? (
            <p>No hi ha preguntes disponibles per a aquest tema.</p>
          ) : (
            preguntes.map((question) => (
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

export default ElementsTests;
