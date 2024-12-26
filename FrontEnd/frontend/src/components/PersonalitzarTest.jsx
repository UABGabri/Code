import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import Headercap from "./Headercap";
import styles from "./StyleComponents/Elements.module.css";
import axios from "axios";

function PersonalitzarTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [preguntesTest, setPreguntesTest] = useState([]);
  const [bancPreguntes, setBancPreguntes] = useState([]);
  const { idTest, idTema } = location.state || {};
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
      })
      .catch(() => alert("Error fetching the test questions."));
  }, [idTest, idTema]);

  // Obtenir les preguntes restants del banc
  const fetchRemainingQuestions = (preguntesTest) => {
    axios
      .get("http://localhost:8081/recoverPreguntesTema", {
        params: { id_tema: idTema },
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
      .catch(() => alert("Error fetching the remaining questions."));
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
          Save Changes
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className={styles.deleteTestButton}
        >
          Delete Test
        </button>
      </header>

      <div className={styles.customBody}>
        <h1>Test Questions</h1>
        <div className={styles.questionsList}>
          {preguntesActualsTest.map((pregunta, index) => (
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
                <strong>Id: </strong>
                {pregunta.id_pregunta}
              </p>
              <button
                className={styles.deleteButton}
                onClick={() => eliminarPregunta(pregunta)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className={styles.paginationControls}>
          <button onClick={prevPage} disabled={paginaActual === 1}>
            Previous
          </button>
          <span>Page {paginaActual}</span>
          <button
            onClick={nextPage}
            disabled={
              paginaActual ===
              Math.ceil(preguntesTest.length / preguntesPerPagina)
            }
          >
            Next
          </button>
        </div>

        <hr className={styles.lineCustom}></hr>

        <h1>Question Bank</h1>
        <div className={styles.questionsList}>
          {preguntesActualsBanc.map((pregunta) => (
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
                className={styles.addButton}
                onClick={() => afegirPregunta(pregunta)}
              >
                Add
              </button>
            </div>
          ))}
        </div>

        <div className={styles.paginationControls}>
          <button onClick={prevPageBanc} disabled={paginaBanc === 1}>
            Previous
          </button>
          <span>Page {paginaBanc}</span>
          <button
            onClick={nextPageBanc}
            disabled={
              paginaBanc ===
              Math.ceil(bancPreguntes.length / preguntesPerPaginaBanc)
            }
          >
            Next
          </button>
        </div>

        {showDeleteModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Are you sure you want to delete this test?</h3>
              <div>
                <button
                  className={styles.deleteTestConfirmButton}
                  onClick={() => {
                    eliminarTest();
                    setShowDeleteModal(false);
                  }}
                >
                  Yes
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
