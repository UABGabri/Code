import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import Headercap from "./Headercap";
import styles from "./StyleComponents/Elements.module.css";
import axios from "axios";
import { FaArrowLeft, FaArrowRight, FaSave, FaTrash } from "react-icons/fa";

function PersonalitzarTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [preguntesTest, setPreguntesTest] = useState([]);
  const [bancPreguntes, setBancPreguntes] = useState([]);
  const { idTest, idTema, idAssignatura } = location.state || {};
  const preguntaArrossegar = useRef(0);
  const preguntaSobreArrossegar = useRef(0);

  // Estat per a la paginació de les preguntes del test
  const [paginaActual, setPaginaActual] = useState(1);
  const preguntesPerPagina = 5;

  // Estat per a gestionar el modal de confirmació de delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Obtenir les preguntes del test seleccionat
  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverSelectedTestWithKeyQuestions", {
        params: { idTest },
      })
      .then((response) => {
        const sortedPreguntes = response.data.Preguntes.sort(
          (a, b) => a.posicio - b.posicio
        );
        setPreguntesTest(sortedPreguntes);
        fetchRemainingQuestions(sortedPreguntes);
        console.log(sortedPreguntes);
      })
      .catch(() => alert("Error fetching the test questions."));
  }, [idTest, idTema]);

  // Obtenir les preguntes restants del banc
  const fetchRemainingQuestions = (preguntesTest) => {
    axios
      .get("http://localhost:8081/recoverPreguntesTema", {
        params: { idAssignatura },
      })
      .then((response) => {
        const filteredPreguntes = response.data.filter(
          (preguntaBanc) =>
            !preguntesTest.some(
              (preguntaTest) =>
                preguntaTest.id_pregunta === preguntaBanc.id_pregunta
            )
        );
        setBancPreguntes(filteredPreguntes);
      })
      .catch(() => alert("Error obtenint les preguntes."));
  };

  // Ordenar les preguntes del test
  const ordenarPreguntes = () => {
    const preguntaClone = [...preguntesTest];
    const temp = preguntaClone[preguntaArrossegar.current];
    preguntaClone[preguntaArrossegar.current] =
      preguntaClone[preguntaSobreArrossegar.current];
    preguntaClone[preguntaSobreArrossegar.current] = temp;

    preguntaClone.forEach((q, index) => (q.posicio = index + 1));
    setPreguntesTest(preguntaClone);

    axios
      .post("http://localhost:8081/updateTestQuestions", {
        idTest,
        questions: preguntaClone.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
      })
      .catch(() => alert("Error saving the order of the questions."));
  };

  // Afegir una pregunta al test
  const afegirPregunta = (pregunta) => {
    const lastPosition = preguntesTest.length + 1;
    const updatedTestPreguntes = [
      ...preguntesTest,
      { ...pregunta, posicio: lastPosition },
    ];
    setPreguntesTest(updatedTestPreguntes);

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
      .catch(() => alert("Error adding the question to the test."));
  };

  // Eliminar una pregunta del test
  const eliminarPregunta = (pregunta) => {
    const updatedTestPreguntes = preguntesTest
      .filter((q) => q.id_pregunta !== pregunta.id_pregunta)
      .map((q, index) => ({ ...q, posicio: index + 1 }));

    setPreguntesTest(updatedTestPreguntes);

    axios
      .post("http://localhost:8081/updateTestQuestions", {
        idTest,
        questions: updatedTestPreguntes.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
      })
      .then(() => setBancPreguntes((prev) => [...prev, pregunta]))
      .catch(() => alert("Error removing the question from the test."));
  };

  // Guardar els canvis realitzats en el test
  const guardarCanvis = () => {
    axios
      .post("http://localhost:8081/updateTestQuestions", {
        idTest,
        questions: preguntesTest.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
      })
      .then(() => alert("Changes saved successfully."))
      .catch(() => alert("Error saving the changes."));
  };

  // Eliminar el test
  const eliminarTest = () => {
    axios
      .delete("http://localhost:8081/deleteTest", {
        params: { idTest },
      })
      .then(() => {
        alert("Test deleted successfully.");
        navigate(-1);
      })
      .catch(() => alert("Error deleting the test."));
  };

  // Lògica de la paginació per a les preguntes del test
  const indexOfLastPregunta = paginaActual * preguntesPerPagina;
  const indexOfFirstPregunta = indexOfLastPregunta - preguntesPerPagina;
  const preguntesActualsTest = preguntesTest.slice(
    indexOfFirstPregunta,
    indexOfLastPregunta
  );

  // Funcions de paginació
  const nextPage = () => {
    if (paginaActual < Math.ceil(preguntesTest.length / preguntesPerPagina)) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const prevPage = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  // Paginació del banc de preguntes
  const [paginaBanc, setPaginaBanc] = useState(1);
  const preguntesPerPaginaBanc = 5;

  const indexOfLastPreguntaBanc = paginaBanc * preguntesPerPaginaBanc;
  const indexOfFirstPreguntaBanc =
    indexOfLastPreguntaBanc - preguntesPerPaginaBanc;
  const preguntesActualsBanc = bancPreguntes.slice(
    indexOfFirstPreguntaBanc,
    indexOfLastPreguntaBanc
  );

  const nextPageBanc = () => {
    if (paginaBanc < Math.ceil(bancPreguntes.length / preguntesPerPaginaBanc)) {
      setPaginaBanc(paginaBanc + 1);
    }
  };

  const prevPageBanc = () => {
    if (paginaBanc > 1) {
      setPaginaBanc(paginaBanc - 1);
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
        <button onClick={guardarCanvis} className={styles.saveButton}>
          <FaSave />
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className={styles.deleteTestButton}
        >
          <FaTrash />
        </button>
      </header>

      <div className={styles.customBody}>
        <h1>Preguntes del Test</h1>
        <div className={styles.questionsList}>
          {preguntesActualsTest.map((pregunta, index) => (
            <>
              <div
                key={pregunta.id_pregunta}
                className={styles.questionCard}
                draggable
                onDragStart={() => (preguntaArrossegar.current = index)}
                onDragEnter={() => (preguntaSobreArrossegar.current = index)}
                onDragEnd={ordenarPreguntes}
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
                  <strong>Tema: </strong>
                  {pregunta.id_tema}
                </p>
                <button
                  className={styles.deleteButton}
                  onClick={() => eliminarPregunta(pregunta)}
                >
                  Eliminar
                </button>
              </div>
            </>
          ))}
        </div>

        <div className={styles.paginationControls}>
          <button
            onClick={prevPage}
            disabled={paginaActual === 1}
            className={styles.ArrowsPages}
          >
            <FaArrowLeft></FaArrowLeft>
          </button>
          <span>Pàgina {paginaActual}</span>
          <button
            onClick={nextPage}
            disabled={
              paginaActual ===
              Math.ceil(preguntesTest.length / preguntesPerPagina)
            }
            className={styles.ArrowsPages}
          >
            <FaArrowRight></FaArrowRight>
          </button>
        </div>

        <hr className={styles.lineCustom}></hr>

        <h1>Banc de preguntes</h1>
        <div className={styles.questionsList}>
          {preguntesActualsBanc.map((pregunta) => (
            <div key={pregunta.id_pregunta} className={styles.questionCard}>
              <div className={styles.questionCardCustom}>
                <p>
                  <strong>Pregunta: </strong>
                  {pregunta.pregunta}
                </p>
                <p>
                  <strong>Solució: </strong>
                  {pregunta.solucio_correcta}
                </p>
                <p>
                  <strong>Tema: </strong>
                  {pregunta.id_tema}
                </p>
              </div>

              <button
                className={styles.addButton}
                onClick={() => afegirPregunta(pregunta)}
              >
                Afegir
              </button>
            </div>
          ))}
        </div>

        <div className={styles.paginationControls}>
          <button
            onClick={prevPageBanc}
            disabled={paginaBanc === 1}
            className={styles.ArrowsPages}
          >
            <FaArrowLeft></FaArrowLeft>
          </button>
          <span>Pàgina {paginaBanc}</span>
          <button
            onClick={nextPageBanc}
            disabled={
              paginaBanc ===
              Math.ceil(bancPreguntes.length / preguntesPerPaginaBanc)
            }
            className={styles.ArrowsPages}
          >
            <FaArrowRight></FaArrowRight>
          </button>
        </div>

        {showDeleteModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Segur que vols eliminar aquest test?</h3>
              <div>
                <button
                  className={styles.deleteTestConfirmButton}
                  onClick={() => {
                    eliminarTest();
                    setShowDeleteModal(false);
                  }}
                >
                  Si
                </button>
                <button
                  className={styles.deleteTestCancelButton}
                  onClick={() => setShowDeleteModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalitzarTest;
