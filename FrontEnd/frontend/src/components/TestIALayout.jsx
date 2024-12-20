import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import styles from "./StyleComponents/TestLayout.module.css";

function TestIALayout() {
  const location = useLocation();
  const { Id_Assignatura } = location.state || {};
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respostesBarrejades, setRespostesBarrejades] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [probabilities, setProbabilities] = useState({});
  const [loading, setLoading] = useState(true);

  // Inicialitza les probabilitats per tema basant-se en els temes recuperats
  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverTemasAssignatura", {
        params: { Id_Assignatura },
      })
      .then((response) => {
        const temesProbability = response.data.map((tema) => tema.id_tema);
        // Assigna probabilitats inicials iguals a tots els temes
        const initialProbabilities = temesProbability.reduce((acc, tema) => {
          acc[tema] = 1 / temesProbability.length;
          return acc;
        }, {});
        setProbabilities(initialProbabilities);
        fetchNextQuestion(initialProbabilities); // Carrega la primera pregunta
      })
      .catch((error) => console.error("Error al carregar els temes:", error));
  }, [Id_Assignatura]);

  // Selecciona un tema aleatòriament segons les probabilitats actuals
  const seleccionarTemaPorProbabilidad = (probabilities) => {
    const random = Math.random(); // Valor entre 0 i 1
    let acumulat = 0;

    for (const [tema, prob] of Object.entries(probabilities)) {
      acumulat += prob;
      if (random <= acumulat) {
        return tema; // Retorna el tema seleccionat
      }
    }
    return null; // Per defecte (no hauria de passar)
  };

  // Obté la següent pregunta basada en el tema seleccionat
  const fetchNextQuestion = (currentProbabilities) => {
    setLoading(true); // Mostra l'estat de càrrega
    const temaSeleccionat =
      seleccionarTemaPorProbabilidad(currentProbabilities);

    console.log(temaSeleccionat);
    axios
      .get("http://localhost:8081/recoverPreguntaByTema", {
        params: { temaSeleccionat },
      })
      .then((response) => {
        const pregunta = response.data;
        setPreguntaActual(pregunta); // Actualitza la pregunta actual
        setRespostesBarrejades(barrejarRespostes(pregunta)); // Barreja les respostes
        setLoading(false); // Finalitza l'estat de càrrega
      })
      .catch((error) => {
        console.error("Error al recuperar la pregunta:", error);
        setLoading(false);
      });
  };

  // Ajusta les probabilitats després de respondre una pregunta
  const ajustarProbabilitats = (temaFallat) => {
    const novesProbabilitats = { ...probabilities };

    // Augmenta la probabilitat del tema fallat
    novesProbabilitats[temaFallat] = Math.min(
      novesProbabilitats[temaFallat] + 0.1,
      1
    );

    // Normalitza les probabilitats perquè la suma sigui 1
    const totalProbabilitats = Object.values(novesProbabilitats).reduce(
      (acc, prob) => acc + prob,
      0
    );
    Object.keys(novesProbabilitats).forEach((tema) => {
      novesProbabilitats[tema] /= totalProbabilitats;
    });

    setProbabilities(novesProbabilitats); // Actualitza les probabilitats
    fetchNextQuestion(novesProbabilitats); // Carrega la següent pregunta
  };

  // Registra la resposta seleccionada i mostra el feedback
  const seleccionarResposta = (respostaUnica, esCorrecta) => {
    if (feedback) return; // No permetre més seleccions fins a la següent pregunta

    setSelectedAnswer(respostaUnica);

    if (esCorrecta) {
      setFeedback({ correct: true }); // Feedback positiu
    } else {
      setFeedback({ correct: false }); // Feedback negatiu
      ajustarProbabilitats(preguntaActual.id_tema); // Incrementa la probabilitat del tema fallat
    }
  };

  // Barreja les respostes de manera aleatòria
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
    return <p>Carregant pregunta... </p>;
  }

  return (
    <div className={styles.containerQuizz}>
      <div className={styles.containerElements}>
        <h1>Qüestionari Infinit</h1>

        <p className={styles.pregunta}>{preguntaActual.pregunta}</p>

        <ul className={styles.llistaRespostes}>
          {respostesBarrejades.map((resposta, index) => (
            <li
              key={index}
              className={
                feedback &&
                ((resposta === preguntaActual.solucio_correcta &&
                  styles.correct) ||
                  (selectedAnswer === resposta &&
                    !feedback.correct &&
                    styles.incorrect))
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

        <button
          onClick={() => fetchNextQuestion(probabilities)}
          disabled={!feedback}
        >
          Següent
        </button>
      </div>
    </div>
  );
}

export default TestIALayout;
