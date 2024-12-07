import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./StyleComponents/TestLayout.module.css";

function TestLayout() {
  const location = useLocation();

  const history = useNavigate();
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
      const respostaSeleccionada = respostaUnica?.split("-")[0]; // Extrae solo el texto
      return respostaSeleccionada === pregunta.solucio_correcta;
    }).length;

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
          <button onClick={() => window.location.reload()}>Reiniciar</button>
          <button onClick={() => history(-1)}>
            Tornar a la pàgina principal
          </button>
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
              <label>
                <input
                  type="radio"
                  name={`pregunta-${currentIndex}`}
                  value={`${resposta}-${index}`}
                  checked={
                    selectedAnswers[currentIndex] === `${resposta}-${index}`
                  }
                  onChange={() => seleccionarResposta(`${resposta}-${index}`)}
                />
                {resposta}
              </label>
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

export default TestLayout;
