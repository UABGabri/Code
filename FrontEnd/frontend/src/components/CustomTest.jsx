import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import Headercap from "./Headercap";
import styles from "./StyleComponents/Elements.module.css";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { FaInfo } from "react-icons/fa6";

const apiUrl = import.meta.env.VITE_API_URL;

function CustomTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [preguntesTest, setPreguntesTest] = useState([]);
  const [bancPreguntes, setBancPreguntes] = useState([]);

  const { idTest, idAssignatura } = location.state || {};
  const preguntaArrossegar = useRef(0);
  const preguntaSobreArrossegar = useRef(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBancModal, setShowBancModal] = useState(false);
  const [showInfoTest, setShowInfoTest] = useState(false);

  //Camps actualització
  const [testName, setTestName] = useState("");
  const [duration, setDuration] = useState("");
  const [data, setData] = useState("");
  const [tipus, setTipus] = useState("");
  const [intents, setIntents] = useState("");
  const [clau, setClau] = useState("");

  // Obtenir les preguntes del test seleccionat
  useEffect(() => {
    axios
      .get(`${apiUrl}/recoverSelectedTestWithKeyQuestions`, {
        params: { idTest },
      })
      .then((response) => {
        console.log(response);
        const sortedPreguntes = response.data.Preguntes.sort(
          (a, b) => a.posicio - b.posicio
        );
        console.log(response);

        setPreguntesTest(sortedPreguntes);
        fetchRemainingQuestions(sortedPreguntes);

        setTestName(sortedPreguntes[0].nom_test);
        setDuration(sortedPreguntes[0].temps / 60);
        const aux = sortedPreguntes[0].data_final;
        const formattedDate = new Date(aux).toISOString().split("T")[0];
        setData(formattedDate);
        setTipus(sortedPreguntes[0].tipus);

        if (tipus === "avaluatiu") {
          setClau(sortedPreguntes[0].clau_acces);
        }
      })
      .catch(() => console.log("Error obtenint les preguntes del test."));
  }, [idTest]);

  // Obtenir les preguntes restants del banc
  const fetchRemainingQuestions = (preguntesTest) => {
    axios
      .get(`${apiUrl}/recoverPreguntesTema`, {
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
      .post(`${apiUrl}/updateTestQuestions`, {
        idTest,
        questions: preguntaClone.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
      })
      .catch(() => alert("Error."));
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
      .post(`${apiUrl}/updateTestQuestions`, {
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
      .catch(() => alert("Error afegint pregunta."));
  };

  // Eliminar una pregunta del test
  const eliminarPregunta = (pregunta) => {
    const updatedTestPreguntes = preguntesTest
      .filter((q) => q.id_pregunta !== pregunta.id_pregunta)
      .map((q, index) => ({ ...q, posicio: index + 1 }));
    setPreguntesTest(updatedTestPreguntes);
    axios
      .post(`${apiUrl}/updateTestQuestions`, {
        idTest,
        questions: updatedTestPreguntes.map((q) => ({
          id_pregunta: q.id_pregunta,
          posicio: q.posicio,
        })),
      })
      .then(() => setBancPreguntes((prev) => [...prev, pregunta]))
      .catch(() => alert("Error treien la pregunta"));
  };

  // Eliminar el test
  const eliminarTest = () => {
    axios
      .delete(`${apiUrl}/deleteTest`, {
        params: { idTest },
      })
      .then(() => {
        alert("Test deleted successfully.");
        navigate(-1);
      })
      .catch(() => alert("Error esborrant el test."));
  };

  //Funció d'aplicar canvis
  const aplicarCanvis = async () => {
    let clauAux;
    let cancelUser = false;

    if (tipus === "avaluatiu") {
      let userInput;

      while (true) {
        userInput = prompt("Introdueix la clau pel nou test:");

        if (userInput === null) {
          alert("No s'ha introduit cap clau.");
          cancelUser = true;
          break;
        }

        const validInput = /^[a-zA-Z0-9]{1,5}$/;
        if (validInput.test(userInput)) {
          alert(`La clau introduïda és: ${userInput}`);
          clauAux = userInput;
          break;
        } else {
          alert(
            "La clau només pot contenir lletres i números, i fins a 5 caràcters."
          );
        }
      }
    } else {
      setClau(" ");
      setIntents(10);
    }

    if (cancelUser) {
      return;
    }

    if (clauAux) {
      setClau(clauAux);
    } else {
      if (tipus === "avaluatiu") {
        alert("No s'ha introduït cap clau.");
      }
    }

    const minutes = duration * 60;

    try {
      const res = await axios.put(`${apiUrl}/updateTestCustom`, {
        testName,
        data,
        minutes,
        tipus,
        clauAux,
        idTest,
        intents,
      });

      if (res.data.Status === "Success") {
        alert("Canvis efectuats");
        setShowInfoTest(false);
      } else {
        alert("Error en el servidor");
      }
    } catch (error) {
      console.error("Error amb la sol·licitud:", error);
      alert("Error amb la sol·licitud");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    aplicarCanvis();
  };

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack
          onClick={() => navigate(-1)}
          className={styles.backArrow}
        />
        <button
          onClick={() => setShowDeleteModal(true)}
          className={styles.deleteTestButton}
        >
          <FaTrash />
        </button>

        <button
          onClick={() => setShowInfoTest(true)}
          className={styles.deleteTestButton}
        >
          <FaInfo />
        </button>
      </header>

      <div className={styles.customBody}>
        <h1>Preguntes del Test {testName}</h1>
        <div className={styles.questionsList}>
          {preguntesTest.map((pregunta, index) => (
            <div key={pregunta.id_pregunta} className={styles.questionOrder}>
              <p> {index + 1}. </p>
              <div
                className={styles.questionCardCustom}
                draggable
                onDragStart={() => {
                  preguntaArrossegar.current = index;
                }}
                onDragEnter={() => {
                  preguntaSobreArrossegar.current = index;
                }}
                onDragEnd={ordenarPreguntes}
                onDragOver={(e) => e.preventDefault()}
              >
                <p>
                  <strong>Tema: </strong>
                  {pregunta.id_tema}
                </p>
                <p>
                  <strong>Conceptes: </strong>
                  {pregunta.conceptes}
                </p>
                <p>
                  <strong>Pregunta: </strong>
                  {pregunta.pregunta}
                </p>
                <p>
                  <strong>Solució: </strong>
                  {pregunta.solucio_correcta}
                </p>

                <button
                  className={styles.deleteButton}
                  onClick={() => eliminarPregunta(pregunta)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className={styles.addButton}
          onClick={() => setShowBancModal(true)}
        >
          Afegir Preguntes
        </button>
        <hr className={styles.lineCustom}></hr>

        {showBancModal && (
          <>
            <div
              className={styles.fonsFosc}
              onClick={() => setShowBancModal(false)}
            ></div>
            <div className={styles.contenidorModal}>
              <button
                className={styles.botoTancar}
                onClick={() => setShowBancModal(false)}
              >
                x
              </button>
              <h1>Banc de preguntes</h1>

              <div className={styles.llistaPreguntes}>
                {bancPreguntes.map((pregunta) => (
                  <div
                    key={pregunta.id_pregunta}
                    className={styles.targetaPregunta}
                  >
                    <div className={styles.contingutTargeta}>
                      <p>
                        <strong>Tema: </strong>
                        {pregunta.id_tema}
                      </p>
                      <p>
                        <strong>Conceptes: </strong>
                        {pregunta.conceptes}
                      </p>
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
                      className={styles.botoAfegir}
                      style={{ backgroundColor: "green" }}
                      onClick={() => afegirPregunta(pregunta)}
                    >
                      Afegir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {showDeleteModal && (
          <>
            <div
              className={styles.fonsFosc}
              onClick={() => setShowDeleteModal(false)}
            ></div>
            <div className={styles.contenidorModal}>
              <button
                className={styles.botoTancar}
                onClick={() => setShowDeleteModal(false)}
              >
                x
              </button>
              <h1>Estàs segur que vols eliminar el test?</h1>
              <button className={styles.addButton} onClick={eliminarTest}>
                Eliminar
              </button>
              <button
                className={styles.addButton}
                style={{ backgroundColor: "red", marginLeft: "10px" }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel·lar
              </button>
            </div>
          </>
        )}

        {showInfoTest && (
          <>
            <div
              className={styles.fonsFosc}
              onClick={() => setShowInfoTest(false)}
            ></div>
            <div className={styles.contenidorModalCustom}>
              <button
                className={styles.botoTancar}
                onClick={() => setShowInfoTest(false)}
              >
                x
              </button>

              <h1>Paràmetres de la Prova</h1>

              <form onSubmit={handleSubmit} className={styles.formUpdate}>
                <div className={styles.updateForm}>
                  <div className={styles.sectionOne}>
                    <label className={styles.inputLabel}>
                      Nom del Test:
                      <input
                        type="text"
                        className={styles.inputField}
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        maxLength="10"
                        required
                      />
                    </label>

                    <label className={styles.inputLabel}>
                      Data de Finalització:
                      <input
                        type="date"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className={styles.inputField}
                        required
                      />
                    </label>

                    <label className={styles.inputLabel}>
                      Duració del test:
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className={styles.inputField}
                        placeholder="En minuts"
                        required
                      />
                    </label>
                  </div>

                  <div style={{ marginRight: "20px" }}>
                    {tipus === "avaluatiu" && (
                      <label
                        className={styles.inputLabel}
                        style={{ marginRight: "20px" }}
                      >
                        Intents:
                        <input
                          type="number"
                          value={intents}
                          onChange={(e) => setIntents(e.target.value)}
                          className={styles.inputField}
                          min={1}
                          required
                        />
                      </label>
                    )}
                  </div>

                  <div style={{ gap: "20px", display: "flex" }}>
                    <button type="submit" className={styles.addButton}>
                      Aplicar Canvis
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => setShowInfoTest(false)}
                    >
                      Cancel·lar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CustomTest;
