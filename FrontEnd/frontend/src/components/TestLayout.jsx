import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./StyleComponents/TestLayout.module.css";

function TestLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [preguntes, setPreguntes] = useState([]);
  const [respostesBarrejades, setRespostesBarrejades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const { tema, concepte, dificultat, id_Assignatura } =
    location.state.parametersTest;

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverRandomTestQuestions", {
        params: { tema, concepte, dificultat, id_Assignatura },
      })
      .then((response) => {
        setPreguntes(response.data.Preguntes);
        setRespostesBarrejades(
          response.data.Preguntes.map((pregunta) => barrejarRespostes(pregunta))
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al recuperar les preguntes:", error);
        setLoading(false);
      });
  }, [tema, concepte, dificultat, id_Assignatura]);

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

  if (showResults) {
    const { correctes, incorrectes } = calcularResultats();
    return (
      <div className={styles.containerQuizz}>
        <h1>Resultats</h1>
        <p>Correctes: {correctes}</p>
        <p>Incorrectes: {incorrectes}</p>
        <div className={styles.resultButtons}>
          {/* Botó per reiniciar el test */}
          <button onClick={() => window.location.reload()}>Reiniciar</button>
          {/* Botó per tornar a la pàgina principal */}
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

export default TestLayout;
