import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import styles from "./StyleComponents/TestLayout.module.css";

function TestIALayout() {
  const location = useLocation();
  const { Id_Assignatura } = location.state || {};
  const [preguntes, setPreguntes] = useState([]);
  const [respostesBarrejades, setRespostesBarrejades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [probabilities, setProbabilities] = useState({});
  const [loading, setLoading] = useState(true);

  // Inicialitza les probabilitats per tema
  useEffect(() => {
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

        console.log(probabilities);
      })
      .catch((error) => console.error("Error al carregar els temes:", error));
  }, [Id_Assignatura]);

  // Recupera preguntes en lots de 10
  const fetchQuestions = () => {
    setLoading(true);
    axios
      .post("http://localhost:8081/recoverTestQuestionsByProbability", {
        probabilities,
        batchSize: 10,
      })
      .then((response) => {
        const novesPreguntes = response.data.Preguntes;
        setPreguntes((prevPreguntes) => [...prevPreguntes, ...novesPreguntes]);
        setRespostesBarrejades((prev) => [
          ...prev,
          ...novesPreguntes.map((pregunta) => barrejarRespostes(pregunta)),
        ]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al recuperar preguntes:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, [probabilities]);

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

  // Registra la resposta seleccionada i aplica feedback immediat
  const seleccionarResposta = (respostaUnica, esCorrecta) => {
    if (feedback) return; // No permetre més seleccions fins a la següent pregunta

    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: respostaUnica });

    if (esCorrecta) {
      setFeedback({ correct: true });
    } else {
      setFeedback({ correct: false });
      const preguntaFallada = preguntes[currentIndex];
      ajustarProbabilitats(preguntaFallada);
    }
  };

  // Ajusta les probabilitats augmentant la del tema de la pregunta fallada
  const ajustarProbabilitats = (preguntaFallada) => {
    const temaFallat = preguntaFallada.tema; // Suposem que "tema" està definit
    const novesProbabilitats = { ...probabilities };

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

    setProbabilities(novesProbabilitats);
  };

  // Carrega la següent pregunta
  const següentPregunta = () => {
    if (currentIndex === preguntes.length - 1) {
      fetchQuestions(); // Si hem arribat al final, demana més preguntes
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    setFeedback(null);
  };

  if (loading) {
    return <p>Carregant preguntes... </p>;
  }

  const preguntaActual = preguntes[currentIndex];
  const respostesActuals = respostesBarrejades[currentIndex];

  return (
    <div className={styles.containerQuizz}>
      <div className={styles.containerElements}>
        <h1>Qüestionari Infinit</h1>

        <p className={styles.pregunta}>{preguntaActual.pregunta}</p>
        <ul className={styles.llistaRespostes}>
          {respostesActuals.map((resposta, index) => (
            <li
              key={index}
              className={
                feedback &&
                ((resposta === preguntaActual.solucio_correcta &&
                  styles.correct) ||
                  (selectedAnswers[currentIndex] === resposta &&
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
                  name={`pregunta-${currentIndex}`}
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
        <button onClick={següentPregunta}>Següent</button>
      </div>
    </div>
  );
}

export default TestIALayout;
