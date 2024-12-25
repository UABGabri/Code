import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./StyleComponents/TestLayout.module.css";

function TestIALayout() {
  const location = useLocation();
  const { idAssignatura } = location.state || {};
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respostesBarrejades, setRespostesBarrejades] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [probabilities, setProbabilities] = useState({});
  const [loading, setLoading] = useState(true);
  const history = useNavigate();
  // Carrega temes i probabilitats
  useEffect(() => {
    const Id_Assignatura = parseInt(idAssignatura);
    axios
      .get("http://localhost:8081/recoverTemasAssignatura", {
        params: { Id_Assignatura },
      })
      .then((response) => {
        const temesProbability = response.data.map((tema) => tema.id_tema);
        const initialProbabilities = temesProbability.reduce((acc, tema) => {
          acc[tema] = 1 / temesProbability.length;
          return acc;
        }, {});

        setProbabilities(initialProbabilities);
        fetchNextQuestion(initialProbabilities); // Carregar pregunta inicial
      })
      .catch((error) => console.error("Error al carregar els temes:", error));
  }, [idAssignatura]);

  // Seleccionar un tema segons les probabilitats
  const seleccionarTemaPerProbabilitat = (probabilities) => {
    const random = Math.random();
    let acumulat = 0;

    for (const [tema, prob] of Object.entries(probabilities)) {
      acumulat += prob;
      if (random <= acumulat) {
        return tema;
      }
    }
    return null;
  };

  // Obté la següent pregunta
  const fetchNextQuestion = (
    currentProbabilities,
    maxRetries = 3,
    retryCount = 0
  ) => {
    //maxRetries i retryCount s'utilitzen per controlar el nombre de reintents en cas de trobar un tema sense pregunta
    setLoading(true);
    const temaSeleccionat =
      seleccionarTemaPerProbabilitat(currentProbabilities);

    console.log(`Intentant recuperar pregunta per al tema: ${temaSeleccionat}`);
    axios
      .get("http://localhost:8081/recoverPreguntaRandom", {
        params: { temaSeleccionat },
      })
      .then((response) => {
        if (response.data.length > 0) {
          const pregunta = response.data[0];
          //console.log("Pregunta trobada:", pregunta);
          setPreguntaActual(pregunta);
          setRespostesBarrejades(barrejarRespostes(pregunta));
          setLoading(false);
        } else {
          if (retryCount < maxRetries) {
            fetchNextQuestion(currentProbabilities, maxRetries, retryCount + 1);
          } else {
            console.error(
              "No s'han pogut obtenir preguntes després de diversos intents."
            );
            setLoading(false);
          }
        }
      })
      .catch((error) => {
        console.error("Error al recuperar la pregunta:", error);
        setLoading(false);
      });
  };

  // Ajusta les probabilitats després de la resposta
  const ajustarProbabilitats = (temaFallat) => {
    const novesProbabilitats = { ...probabilities };
    novesProbabilitats[temaFallat] = Math.min(
      novesProbabilitats[temaFallat] + 0.1,
      1
    );

    const totalProbabilitats = Object.values(novesProbabilitats).reduce(
      (acc, prob) => acc + prob,
      0
    );
    Object.keys(novesProbabilitats).forEach((tema) => {
      novesProbabilitats[tema] /= totalProbabilitats;
    });

    setProbabilities(novesProbabilitats);
  };

  // Barreja les respostes
  const barrejarRespostes = (pregunta) => {
    const respostes = [
      pregunta.solucio_correcta,
      pregunta.solucio_erronia1,
      pregunta.solucio_erronia2,
      pregunta.solucio_erronia3,
    ];
    return respostes.sort(() => Math.random() - 0.5);
  };

  if (loading) {
    return <p>Carregant pregunta...</p>;
  }

  // Selecciona la resposta
  const seleccionarResposta = (respostaUnica, esCorrecta) => {
    if (feedback) return; // No permetre nova selecció fins a la següent pregunta

    setSelectedAnswer(respostaUnica);
    if (esCorrecta) {
      setFeedback({ correct: true });
    } else {
      setFeedback({ correct: false });
      ajustarProbabilitats(preguntaActual.id_tema); // Només ajustar probabilidades
    }
  };

  // Passar a la següent pregunta
  const handleNextQuestion = () => {
    setFeedback(null); // Netejar feedback
    setSelectedAnswer(null); // Netejar selecció
    fetchNextQuestion(probabilities); // Carregar nova pregunta
  };

  return (
    <div className={styles.containerQuizz}>
      <div className={styles.containerElements}>
        <h1>Qüestionari IA</h1>

        <p className={styles.pregunta}>{preguntaActual.pregunta}</p>

        <ul className={styles.llistaRespostes}>
          {respostesBarrejades.map((resposta, index) => (
            <li
              key={index}
              className={
                feedback
                  ? resposta === preguntaActual.solucio_correcta
                    ? styles.correctAnswer
                    : selectedAnswer === resposta && !feedback.correct
                    ? styles.incorrectAnswer
                    : undefined
                  : undefined
              }
              onClick={() =>
                seleccionarResposta(
                  resposta,
                  resposta === preguntaActual.solucio_correcta
                )
              }
            >
              <label>
                <input
                  type="radio"
                  name="resposta"
                  value={resposta}
                  disabled={!!feedback}
                />
                {resposta}
              </label>
            </li>
          ))}
        </ul>

        {feedback && (
          <p
            className={
              feedback.correct
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect
            }
          >
            {feedback.correct
              ? "Correcte!"
              : `Incorrecte. La resposta correcta era: ${preguntaActual.solucio_correcta}`}
          </p>
        )}

        <button onClick={handleNextQuestion} disabled={!feedback}>
          Següent
        </button>

        <button onClick={() => history(-1)}>Sortir</button>
      </div>
    </div>
  );
}

export default TestIALayout;
