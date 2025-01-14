import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Headercap from "./Headercap";
import styles from "./StyleComponents/CreateQuizzLayout.module.css";
import { BiArrowBack } from "react-icons/bi";
import { FaPlus, FaTrash } from "react-icons/fa6";

function CreateQuizz() {
  const navigate = useNavigate();
  const location = useLocation();

  const [temes, setTemes] = useState([]);
  const [seleccions, setSeleccions] = useState([]);
  const [temaSeleccionat, setTemaSeleccionat] = useState("");
  const [numeroPreguntes, setNumeroPreguntes] = useState(1);
  const [dataFinalitzacio, setDataFinalitzacio] = useState("");
  const [duracio, setDuracio] = useState("");
  const [isFinalModal, setIsFinalModalOpen] = useState(false);
  const { id_assignatura, id_professor, id_tema, tipus } = location.state || {};
  const [errorSelect, setErrorSelect] = useState("");
  const [nomTest, setNomTest] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverTemasAssignaturaPreguntes", {
        params: { Id_Assignatura: id_assignatura },
      })
      .then((response) => setTemes(response.data))
      .catch((error) => console.error("Error al recuperar temes:", error));
  }, [id_assignatura]);

  const addTopic = () => {
    if (!temaSeleccionat) return;
    const exists = seleccions.find(
      (seleccio) => seleccio.id === parseInt(temaSeleccionat)
    );

    if (!exists) {
      const tema = temes.find((t) => t.id_tema === parseInt(temaSeleccionat));
      setSeleccions((prev) => [
        ...prev,
        {
          id: tema.id_tema,
          nom_tema: tema.nom_tema,
          preguntes: numeroPreguntes,
        },
      ]);
      setTemaSeleccionat("");
      setNumeroPreguntes(1);
    }
  };

  const createQuizz = () => {
    setIsFinalModalOpen(true);
  };

  const confirmCreateQuiz = () => {
    const durationNormal = parseInt(duracio) * 60;

    console.log(durationNormal);
    axios
      .post("http://localhost:8081/createQuizz", {
        seleccions,
        nom_test: nomTest,
        id_creador: id_professor,
        id_assignatura,
        id_tema,
        tipus,
        data_finalitzacio: dataFinalitzacio,
        durationNormal,
      })
      .then((response) => {
        console.log(response.data.Status);

        const clau = response.data.clau_acces;
        if (response.data.Status === "Test creat correctament") {
          if (tipus === "avaluatiu") {
            alert("Test creat correctament amb clau: " + clau);
          } else {
            alert("Test creat correctament!");
          }

          window.location.reload();
        } else {
          alert("Error al crear el test.");
        }
      })
      .catch((error) => console.error("Error al crear el test:", error));
  };

  return (
    <div>
      <Headercap />
      <div className={styles.container}>
        <BiArrowBack
          onClick={() => navigate(-1)}
          className={styles.arrowBack}
        />

        <div className={styles.containerTitle}>
          <strong className={styles.titleGenerator}>Creació de Tests</strong>
          <div className={styles.quizzContainerBody}>
            <div className={styles.formRandom}>
              <div className={styles.formGroup}>
                <label>Selecciona els temes:</label>
                <select
                  value={temaSeleccionat}
                  onChange={(e) => setTemaSeleccionat(e.target.value)}
                >
                  <option value="">Selecciona els Temes</option>
                  {temes
                    .filter(
                      (tema) =>
                        !seleccions.some((sel) => sel.id === tema.id_tema)
                    )
                    .sort((a, b) => a.nom_tema.localeCompare(b.nom_tema))
                    .map((tema) => (
                      <option key={tema.id_tema} value={tema.id_tema}>
                        {tema.nom_tema}
                      </option>
                    ))}
                </select>

                <button onClick={addTopic}>
                  <FaPlus />
                </button>
              </div>

              <div className={styles.scrollTopics}>
                <h3>Resum de Temes Seleccionats</h3>
                <ul className={styles.selectedTopics}>
                  {seleccions.length > 0 ? (
                    seleccions.map((seleccio) => (
                      <li key={seleccio.id}>
                        {seleccio.nom_tema} - Preguntes:
                        <input
                          type="number"
                          min="1"
                          max="15"
                          value={seleccio.preguntes}
                          onChange={(e) =>
                            setSeleccions((prev) =>
                              prev.map((sel) =>
                                sel.id === seleccio.id
                                  ? {
                                      ...sel,
                                      preguntes: parseInt(e.target.value),
                                    }
                                  : sel
                              )
                            )
                          }
                          className={styles.selectedTopic}
                        />
                        <button
                          onClick={() =>
                            setSeleccions((prev) =>
                              prev.filter((sel) => sel.id !== seleccio.id)
                            )
                          }
                        >
                          <FaTrash />
                        </button>
                      </li>
                    ))
                  ) : (
                    <p>No hi ha temes seleccionats</p>
                  )}
                </ul>
              </div>
              <button onClick={createQuizz} disabled={seleccions.length === 0}>
                Crear Test Automàtic
              </button>
            </div>

            <button
              onClick={() => {
                navigate("/manualTest", {
                  state: { id_assignatura, id_professor, id_tema, tipus },
                });
              }}
              className={styles.colorButt}
            >
              Crear Test Manual
            </button>
          </div>
        </div>
      </div>

      {isFinalModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <strong className={styles.titleGenerator}>Crear Test</strong>

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
                      setDuracio(inputValue);
                    }
                  }}
                  className={styles.inputField}
                  placeholder="En minuts"
                />
              </label>
            </div>

            <div className={styles.modalButtons}>
              <button onClick={confirmCreateQuiz} className={styles.colorButt}>
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
    </div>
  );
}

export default CreateQuizz;
