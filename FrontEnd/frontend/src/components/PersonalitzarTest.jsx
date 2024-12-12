import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import Headercap from "./Headercap";
import styles from "./StyleComponents/Elements.module.css";
import axios from "axios";

function PersonalitzarTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [testPreguntes, setTestPreguntes] = useState([]);
  const [bancPreguntes, setBancPreguntes] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const { idTest, idTema } = location.state || {};
  const dragPregunta = useRef(0);
  const dragOverPregunta = useRef(0);

  const handleSort = () => {
    const preguntaClone = [...testPreguntes];

    const temp = preguntaClone[dragPregunta.current];

    preguntaClone[dragPregunta.current] =
      preguntaClone[dragOverPregunta.current];

    preguntaClone[dragOverPregunta.current] = temp;

    setTestPreguntes(preguntaClone);
  };

  useEffect(() => {
    console.log(idTema);

    axios
      .get("http://localhost:8081/recoverSelectedTestWithKeyQuestions", {
        params: { idTest },
      })
      .then((response) => {
        setTestPreguntes(response.data.Preguntes);
      })
      .catch((error) => alert("Error al recuperar les preguntes del test."));

    axios
      .get("http://localhost:8081/recoverPreguntesTema", {
        params: { id_tema: idTema },
      })
      .then((response) => {
        setBancPreguntes(response.data);
      })
      .catch((error) => alert("Error al recuperar el banc de preguntes."));
  }, [idTest, idTema]);

  const handleAddQuestions = () => {
    const newQuestions = bancPreguntes.filter((q) =>
      selectedQuestions.includes(q.id_pregunta)
    );
    setTestPreguntes((prev) => [...prev, ...newQuestions]);
    setSelectedQuestions([]);
  };

  const handleRemoveQuestion = (id_pregunta) => {
    setTestPreguntes((prev) =>
      prev.filter((q) => q.id_pregunta !== id_pregunta)
    );
  };

  const handleSaveChanges = () => {
    const updatedTest = testPreguntes.map((q, index) => ({
      id_pregunta: q.id_pregunta,
      posicio: index + 1,
    }));

    axios
      .post("http://localhost:8081/updateTestQuestions", {
        idTest,
        questions: updatedTest,
      })
      .then(() => alert("Canvis guardats correctament."))
      .catch(() => alert("Error al guardar els canvis."));
  };

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack
          onClick={() => navigate(-1)}
          className={styles.backArrow}
        />
        <button onClick={handleSaveChanges} className={styles.saveButton}>
          Guardar Canvis
        </button>
      </header>

      <div className={styles.customBody}>
        <h1>Ordre Preguntes del Test</h1>
        <div className={styles.questionsList}>
          {testPreguntes.map((pregunta, index) => (
            <div
              key={pregunta.id_pregunta}
              className={styles.questionCard}
              draggable
              onDragStart={() => (dragPregunta.current = index)}
              onDragEnter={() => (dragOverPregunta.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className={styles.questionDetails}>
                <p>
                  <strong>Pregunta:</strong> {pregunta.pregunta}
                </p>
                <p>
                  <strong>Dificultat:</strong> {pregunta.dificultat}
                </p>
                <p>
                  <strong>Solucio:</strong> {pregunta.solucio_correcta}
                </p>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleRemoveQuestion(pregunta.id_pregunta)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <hr className={styles.lineCustom}></hr>
        <h1>Banc de Preguntes {idTema}</h1>
        <div className={styles.questionsList}>
          {bancPreguntes.map((pregunta) => (
            <div key={pregunta.id_pregunta} className={styles.questionCard}>
              <div className={styles.questionDetails}>
                <p>
                  <strong>Pregunta:</strong> {pregunta.pregunta}
                </p>
                <p>
                  <strong>Dificultat:</strong> {pregunta.dificultat}
                </p>
                <p>
                  <strong>Solucio:</strong> {pregunta.solucio_correcta}
                </p>
              </div>
              <input
                type="checkbox"
                checked={selectedQuestions.includes(pregunta.id_pregunta)}
                onChange={() =>
                  setSelectedQuestions((prev) =>
                    prev.includes(pregunta.id_pregunta)
                      ? prev.filter((id) => id !== pregunta.id_pregunta)
                      : [...prev, pregunta.id_pregunta]
                  )
                }
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleAddQuestions}
          className={styles.addQuestionButton}
        >
          Afegir Preguntes Seleccionades
        </button>
      </div>
    </div>
  );
}

export default PersonalitzarTest;
