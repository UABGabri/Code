import axios from "axios";
import styles from "./StyleComponents/TestLayout.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function TestWithKey() {
  const location = useLocation();
  //const navigate = useNavigate();
  const history = useNavigate();
  const [preguntes, setPreguntes] = useState([]);
  const [respostesBarrejades, setRespostesBarrejades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const { idTest } = location.state || {};

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverSelectedTestWithKeyQuestions", {
        params: { idTest },
      })
      .then((response) => {
        setPreguntes(response.data.Preguntes);
        setRespostesBarrejades(
          response.data.Preguntes.map((pregunta) => barrejarRespostes(pregunta))
        );
        setLoading(false);
      })
      .catch(() => {
        setError("No s'ha pogut recuperar les preguntes. Intenta-ho més tard.");
        setLoading(false);
      });
  }, [idTest]);

  const barrejarRespostes = (pregunta) => {
    const respostes = [
      pregunta.solucio_correcta,
      pregunta.solucio_erronia1,
      pregunta.solucio_erronia2,
      pregunta.solucio_erronia3,
    ];
    return respostes.sort(() => Math.random() - 0.5);
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

  if (showResults) {
    const { correctes, incorrectes, percentatge } = calcularResultats();
    return (
      <div className={styles.containerQuizz}>
        <div className={styles.resultsBox}>
          <h1>Resultats</h1>
          <p>Correctes: {correctes}</p>
          <p>Incorrectes: {incorrectes}</p>
          <p>Nota: {percentatge}%</p>{" "}
          <div className={styles.resultButtons}>
            <button onClick={() => window.location.reload()}>Reiniciar</button>
            <button onClick={() => history(-1)}>
              Tornar a la pàgina principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const respostesActuals = respostesBarrejades[currentIndex];

  return (
    <div className={styles.containerQuizz}>
      <div className={styles.containerElements}>
        <h1>Formulari</h1>
        <hr />
        <p className={styles.pregunta}>{preguntes[currentIndex].pregunta}</p>
        <ul className={styles.llistaRespostes}>
          {respostesActuals.map((resposta, index) => (
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
          ))}
        </ul>
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
