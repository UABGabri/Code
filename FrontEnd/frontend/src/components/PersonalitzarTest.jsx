import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import Headercap from "./Headercap";
import styles from "./StyleComponents/Elements.module.css";
import axios from "axios";

//Component de personalització del test avaluatiu
function PersonalitzarTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [testPreguntes, setTestPreguntes] = useState([]);
  const [bancPreguntes, setBancPreguntes] = useState([]);
  const { idTest, idTema } = location.state || {};
  const dragPregunta = useRef(0);
  const dragOverPregunta = useRef(0);

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverSelectedTestWithKeyQuestions", {
        params: { idTest },
      })
      .then((response) => {
        const sortedPreguntes = response.data.Preguntes.sort(
          (a, b) => a.posicio - b.posicio
        );
        setTestPreguntes(sortedPreguntes);
        fetchRemainingQuestions(sortedPreguntes);
      })
      .catch(() => alert("Error al recuperar les preguntes del test."));
  }, [idTest, idTema]);

  const fetchRemainingQuestions = (preguntasTest) => {
    axios
      .get("http://localhost:8081/recoverPreguntesTema", {
        params: { id_tema: idTema },
      })
      .then((response) => {
        const filteredPreguntes = response.data.filter(
          (bancPregunta) =>
            !preguntasTest.some(
              (testPregunta) =>
                testPregunta.id_pregunta === bancPregunta.id_pregunta
            )
        );
        setBancPreguntes(filteredPreguntes);
      })
      .catch(() =>
        alert("Error al recuperar el banc de preguntes disponibles.")
      );
  };

  const handleSort = () => {
    const preguntaClone = [...testPreguntes];
    const temp = preguntaClone[dragPregunta.current];
    preguntaClone[dragPregunta.current] =
      preguntaClone[dragOverPregunta.current];
    preguntaClone[dragOverPregunta.current] = temp;

    preguntaClone.forEach((q, index) => (q.posicio = index + 1));
    setTestPreguntes(preguntaClone);

    axios
      .post("http://localhost:8081/updateTestQuestions", {
        idTest,
        questions: preguntaClone.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
      })
      .catch(() =>
        alert("Error al guardar els canvis d'ordre de les preguntes.")
      );
  };

  const handleAddQuestion = (pregunta) => {
    const lastPosition = testPreguntes.length + 1;
    const updatedTestPreguntes = [
      ...testPreguntes,
      { ...pregunta, posicio: lastPosition },
    ];
    setTestPreguntes(updatedTestPreguntes);

    axios
      .post("http://localhost:8081/updateTestQuestions", {
        idTest,
        questions: updatedTestPreguntes.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
      })
      .then(() =>
        setBancPreguntes((prev) =>
          prev.filter((q) => q.id_pregunta !== pregunta.id_pregunta)
        )
      )
      .catch(() => alert("Error al afegir la pregunta al test."));
  };

  const handleRemoveQuestion = (pregunta) => {
    const updatedTestPreguntes = testPreguntes
      .filter((q) => q.id_pregunta !== pregunta.id_pregunta)
      .map((q, index) => ({ ...q, posicio: index + 1 }));

    setTestPreguntes(updatedTestPreguntes);

    axios
      .post("http://localhost:8081/updateTestQuestions", {
        idTest,
        questions: updatedTestPreguntes.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
      })
      .then(() => setBancPreguntes((prev) => [...prev, pregunta]))
      .catch(() => alert("Error al eliminar la pregunta del test."));
  };

  const handleSaveChanges = () => {
    axios
      .post("http://localhost:8081/updateTestQuestions", {
        idTest,
        questions: testPreguntes.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
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
        <h1>Preguntes del Test</h1>
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
              <p>
                <strong>Pregunta: </strong>
                {pregunta.pregunta}
              </p>
              <p>
                <strong>Solució: </strong>
                {pregunta.solucio_correcta}
              </p>
              <p>
                <strong>Id: </strong>
                {pregunta.id_pregunta}
              </p>
              <button
                className={styles.deleteButton}
                onClick={() => handleRemoveQuestion(pregunta)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <hr className={styles.lineCustom}></hr>

        <h1>Banc de Preguntes</h1>
        <div className={styles.questionsList}>
          {bancPreguntes.map((pregunta) => (
            <div key={pregunta.id_pregunta} className={styles.questionCard}>
              <p>
                <strong>Pregunta: </strong>
                {pregunta.pregunta}
              </p>
              <p>
                <strong>Solució: </strong>
                {pregunta.solucio_correcta}
              </p>
              <p>
                <strong>Id: </strong>
                {pregunta.id_pregunta}
              </p>
              <button
                className={styles.addQuestionButton}
                onClick={() => handleAddQuestion(pregunta)}
              >
                Afegir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PersonalitzarTest;
