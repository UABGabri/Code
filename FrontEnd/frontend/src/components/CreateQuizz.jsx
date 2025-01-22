import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Headercap from "./Headercap";
import styles from "./StyleComponents/CreateQuizzLayout.module.css";
import { BiArrowBack } from "react-icons/bi";
import { FaPlus, FaTrash } from "react-icons/fa6";

const apiUrl = import.meta.env.VITE_API_URL2;

function CreateQuizz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [temes, setTemes] = useState([]);
  const [seleccions, setSeleccions] = useState([]);
  const [temaSeleccionat, setTemaSeleccionat] = useState("");
  const [dificultatSeleccionada, setDificultatSeleccionada] = useState("");
  const [numeroPreguntes, setNumeroPreguntes] = useState(1);
  const [dataFinalitzacio, setDataFinalitzacio] = useState("");
  const [duracio, setDuracio] = useState("");
  const [isFinalModal, setIsFinalModalOpen] = useState(false);
  const { id_assignatura, id_professor, id_tema, tipus } = location.state || {};
  const [nomTest, setNomTest] = useState("");
  const [clau, setClau] = useState("null");
  const [intents, setIntents] = useState(10);

  useEffect(() => {
    if (!id_assignatura) return;

    axios
      .get(`${apiUrl}/recoverTopicSubjectQuestions`, {
        params: { Id_Assignatura: id_assignatura },
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setTemes(response.data);
        } else {
          setTemes([]);
        }
      })
      .catch((error) => console.error("Error al recuperar temes:", error));
  }, [id_assignatura]);

  const addTopic = () => {
    if (!temaSeleccionat || !dificultatSeleccionada) return;

    const tema = temes.find((t) => t.id_tema === parseInt(temaSeleccionat));

    setSeleccions((prev) => [
      ...prev,
      {
        id: tema.id_tema,
        nom_tema: tema.nom_tema,
        dificultat: dificultatSeleccionada,
        preguntes: numeroPreguntes,
      },
    ]);

    setTemaSeleccionat("");
    setDificultatSeleccionada("");
    setNumeroPreguntes(1);
  };

  const createQuizz = () => {
    setIsFinalModalOpen(true);
  };

  const confirmCreateQuiz = () => {
    const durationNormal = parseInt(duracio) * 60;

    axios
      .post(`${apiUrl}/createQuizz`, {
        seleccions,
        nom_test: nomTest,
        id_creador: id_professor,
        id_assignatura,
        id_tema,
        tipus,
        data_finalitzacio: dataFinalitzacio,
        durationNormal,
        clau,
        intents,
      })
      .then((response) => {
        console.log(response);

        if (response.data.Status === "Success") {
          if (tipus === "avaluatiu") {
            alert("Test creat correctament");
          } else {
            alert("Test creat correctament!");
          }
        } else {
          if (response.data.Status === "Failed")
            alert("No s'ha trobat cap pregunta coincident. Test buit.");
        }

        setIsFinalModalOpen(false);
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
              <div className={styles.spaceFilters}>
                <div className={styles.formGroup}>
                  <label>Selecciona els temes:</label>
                  <select
                    value={temaSeleccionat}
                    onChange={(e) => setTemaSeleccionat(e.target.value)}
                  >
                    <option value="">Selecciona els Temes</option>
                    {Array.isArray(temes) &&
                      temes.map((tema) => (
                        <option key={tema.id_tema} value={tema.id_tema}>
                          {tema.nom_tema}
                        </option>
                      ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Dificultat:</label>
                  <select
                    value={dificultatSeleccionada}
                    onChange={(e) => setDificultatSeleccionada(e.target.value)}
                  >
                    <option value="">Selecciona la Dificultat</option>
                    <option value="Fàcil">Fàcil</option>
                    <option value="Mitjà">Mitjà</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                  <button onClick={addTopic}>
                    <FaPlus />
                  </button>
                </div>
              </div>

              <div className={styles.scrollTopics}>
                <h3>Resum de Temes Seleccionats</h3>
                <ul className={styles.selectedTopics}>
                  {seleccions.length > 0 ? (
                    seleccions.map((seleccio, index) => (
                      <li key={`${seleccio.id}-${index}`}>
                        {seleccio.nom_tema} - Preguntes:
                        <input
                          type="number"
                          min="1"
                          max="15"
                          value={seleccio.preguntes}
                          onChange={(e) =>
                            setSeleccions((prev) =>
                              prev.map((sel, idx) =>
                                idx === index
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
                        <span> Dificultat: {seleccio.dificultat}</span>
                        <button
                          onClick={() =>
                            setSeleccions((prev) =>
                              prev.filter((_, idx) => idx !== index)
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmCreateQuiz();
              }}
            >
              <div className={styles.modalLabels}>
                <label className={styles.inputLabel}>
                  Nom del Test:
                  <input
                    type="text"
                    className={styles.inputField}
                    value={nomTest}
                    required
                    maxLength={10}
                    pattern="[a-zA-Z0-9]+"
                    onChange={(e) => {
                      const inputValue = e.target.value;

                      setNomTest(inputValue);
                    }}
                    placeholder="Nom del test"
                  />
                </label>

                <label className={styles.inputLabel}>
                  Data de Finalització:
                  <input
                    type="date"
                    required
                    value={dataFinalitzacio}
                    onChange={(e) => setDataFinalitzacio(e.target.value)}
                    className={styles.inputField}
                  />
                </label>

                <label className={styles.inputLabel}>
                  Duració del test:
                  <input
                    type="text"
                    className={styles.inputField}
                    value={duracio}
                    required
                    maxLength={3}
                    placeholder="En minuts"
                    pattern="\d{1,3}"
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setDuracio(inputValue);
                    }}
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
                        min={1}
                      />
                    </label>
                  </>
                )}
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.colorButt}>
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setIsFinalModalOpen(false)}
                  className={styles.colorButtDel}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateQuizz;
