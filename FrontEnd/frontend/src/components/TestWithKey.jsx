import axios from "axios";
import styles from "./StyleComponents/TestLayout.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

//Creació layout del Test amb clau
function TestWithKey() {
  const location = useLocation();
  const history = useNavigate();
  const [preguntes, setPreguntes] = useState([]);
  const [respostesBarrejades, setRespostesBarrejades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const { idTest, Id_User } = location.state || {};
  const [avaluatiu, setAvaluatiu] = useState(false);
  const [Id_Subject, setIdSubject] = useState("");
  const [time, setTime] = useState(10);
  const [resultsSent, setResultsSent] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // La funció useEffect es llança dos cops pel mode dev -> resultats enviats dos cops -> cal aplicar funció de normalització
  useEffect(() => {
    axios
      .get(`${apiUrl}/recoverSelectedTestWithKeyQuestions`, {
        params: { idTest },
      })
      .then((response) => {
        const preguntasConContenido = response.data.Preguntes.filter(
          (pregunta) => pregunta.pregunta && pregunta.pregunta.trim() !== ""
        ).sort((a, b) => a.posicio - b.posicio);

        if (response.data.Preguntes[0].tipus === "avaluatiu") {
          setAvaluatiu(true);
        }

        console.log(response.data.Preguntes[0].tipus);

        setTime(parseInt(response.data.Preguntes[0].temps * 60));

        setPreguntes(preguntasConContenido);
        setRespostesBarrejades(
          preguntasConContenido.map((pregunta) => barrejarRespostes(pregunta))
        );

        setIdSubject(response.data.Preguntes[0]?.id_assignatura);
        setLoading(false);
      })
      .catch(() => {
        setError("No s'ha pogut recuperar les preguntes. Intenta-ho més tard.");
        setLoading(false);
      });
  }, [idTest]);

  //Funció de temporitzador
  useEffect(() => {
    if (time > 0) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      clearInterval();
      setShowResults(true);
    }
  }, [time]);

  // Filtra las respostes buides en barrejarRespostes
  const barrejarRespostes = (pregunta) => {
    const respostes = [
      pregunta.solucio_correcta,
      pregunta.solucio_erronia1,
      pregunta.solucio_erronia2,
      pregunta.solucio_erronia3,
    ];

    // Filtra respostes buides
    const respostesFiltradas = respostes.filter(
      (resposta) => resposta && resposta.trim() !== ""
    );
    return respostesFiltradas.sort(() => Math.random() - 0.5);
  };

  const seleccionarResposta = (respostaUnica) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: respostaUnica });
  };

  const anarSeguent = () => {
    if (currentIndex < preguntes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const anarAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calcularResultats = () => {
    const correctes = preguntes.filter((pregunta, index) => {
      const respostaUnica = selectedAnswers[index];
      const respostaSeleccionada = respostaUnica?.split("-")[0];
      return respostaSeleccionada === pregunta.solucio_correcta;
    }).length;

    const incorrectes = preguntes.length - correctes;
    const percentatge = ((correctes / preguntes.length) * 100).toFixed(2);

    return { correctes, incorrectes, percentatge };
  };

  if (loading) {
    return <p>Carregant preguntes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (respostesBarrejades.length === 0 || preguntes.length === 0) {
    return <p>No han trobat preguntes per aquest test.</p>;
  }

  const enviarResultats = async (resultats) => {
    if (resultsSent) return;
    setResultsSent(true);

    try {
      await axios.post(`${apiUrl}/saveResults`, {
        idTest,
        nota: resultats.percentatge,
        Id_User,
        Id_Subject,
      });
    } catch (error) {
      console.error("Error al guardar resultats:", error);
    }
  };

  const handleDetails = () => {
    console.log("detalls");
    setShowModal(true);
  };

  if (showResults) {
    const { correctes, incorrectes, percentatge } = calcularResultats();

    return (
      <div className={styles.containerQuizz}>
        <div className={styles.resultsBox}>
          <h1>Resultats</h1>
          <p>Correctes: {correctes}</p>
          <p>Incorrectes: {incorrectes}</p>
          <p>Nota: {percentatge}%</p>
          <div className={styles.resultButtons}>
            {avaluatiu ? (
              <button
                onClick={() => {
                  enviarResultats({ percentatge });
                  history(-1);
                }}
                className={styles.endButtons}
              >
                Tornar a la pàgina principal
              </button>
            ) : (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className={styles.endButtons}
                >
                  Reiniciar
                </button>

                <button
                  onClick={() => history(-1)}
                  className={styles.endButtons}
                >
                  Inici
                </button>

                <button onClick={handleDetails} className={styles.endButtons}>
                  Detalls
                </button>
              </>
            )}

            {showModal && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <h2>Detalls de les Respostes</h2>
                  <ul className={styles.modalList}>
                    {preguntes.map((pregunta, index) => {
                      const respostaSeleccionada =
                        selectedAnswers[index]?.split("-")[0] ||
                        "No seleccionada";
                      const correcta = pregunta.solucio_correcta;

                      return (
                        <li key={index} className={styles.modalListItem}>
                          <p>
                            <strong>Pregunta:</strong> {pregunta.pregunta}
                          </p>
                          <p>
                            <strong>Resposta seleccionada:</strong>{" "}
                            <span
                              className={
                                respostaSeleccionada === correcta
                                  ? styles.correct
                                  : styles.incorrect
                              }
                            >
                              {respostaSeleccionada}
                            </span>
                          </p>
                          <p>
                            <strong>Resposta correcta:</strong>{" "}
                            <span className={styles.correct}>{correcta}</span>
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    className={styles.closeModalButton}
                    onClick={() => setShowModal(false)}
                  >
                    Tancar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const respostesActuals = respostesBarrejades[currentIndex];

  return (
    <div className={styles.containerQuizz}>
      <div className={styles.containerElements}>
        <p className={styles.pregunta}>{preguntes[currentIndex]?.pregunta}</p>
        <ul className={styles.llistaRespostes}>
          {respostesActuals.map(
            (resposta, index) =>
              resposta && (
                <li
                  key={index}
                  className={
                    selectedAnswers[currentIndex] === `${resposta}-${index}`
                      ? styles.selected
                      : ""
                  }
                  onClick={() => seleccionarResposta(`${resposta}-${index}`)}
                >
                  {resposta}
                </li>
              )
          )}
        </ul>
        <p>Temps Restant: {time}</p>
        <p className={styles.contadorPreguntes}>
          Pregunta {currentIndex + 1} de {preguntes.length}
        </p>

        <div className={styles.botonsAccio}>
          <button onClick={anarAnterior} disabled={currentIndex === 0}>
            Anterior
          </button>
          <button onClick={anarSeguent}>
            {currentIndex === preguntes.length - 1 ? "Entregar" : "Següent"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestWithKey;
