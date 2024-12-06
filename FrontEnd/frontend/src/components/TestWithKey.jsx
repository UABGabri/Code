import axios from "axios";
import styles from "./StyleComponents/TestLayout.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function TestWithKey() {
  const location = useLocation();
  const navigate = useNavigate();
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
        console.log(response.data.Preguntes);
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

  const seleccionarResposta = (resposta) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: resposta });
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
    const correctes = preguntes.filter(
      (pregunta, index) => selectedAnswers[index] === pregunta.solucio_correcta
    ).length;
    const incorrectes = preguntes.length - correctes;
    return { correctes, incorrectes };
  };

  if (loading) {
    return <p>Carregant preguntes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (respostesBarrejades.length === 0 || preguntes.length === 0) {
    return <p>No s'han trobat preguntes per aquest test.</p>;
  }

  if (showResults) {
    const { correctes, incorrectes } = calcularResultats();
    return (
      <div className={styles.containerQuizz}>
        <h1>Resultats</h1>
        <p>Correctes: {correctes}</p>
        <p>Incorrectes: {incorrectes}</p>
        <div className={styles.resultButtons}>
          <button onClick={() => window.location.reload()}>Reiniciar</button>
          <button onClick={() => navigate("/modules")}>
            Tornar a la pàgina principal
          </button>
        </div>
      </div>
    );
  }

  const respostesActuals = respostesBarrejades[currentIndex];

  return (
    <div className={styles.containerQuizz}>
      <h1>Formulari</h1>
      <hr />
      <h2>
        Pregunta {currentIndex + 1} de {preguntes.length}
      </h2>
      <p>{preguntes[currentIndex].pregunta}</p>
      <ul>
        {respostesActuals.map((resposta, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                name={`pregunta-${currentIndex}`}
                value={resposta}
                checked={selectedAnswers[currentIndex] === resposta}
                onChange={() => seleccionarResposta(resposta)}
              />
              {resposta}
            </label>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={anarAnterior} disabled={currentIndex === 0}>
          Anterior
        </button>
        <button onClick={anarSeguent}>
          {currentIndex === preguntes.length - 1 ? "Entregar" : "Següent"}
        </button>
      </div>
    </div>
  );
}

export default TestWithKey;
