import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./StyleComponents/TestLayout.module.css";

function TestLayout() {
  const location = useLocation();
  const { conceptesSeleccionats } = location.state.parametersTest;

  const history = useNavigate();
  const [preguntes, setPreguntes] = useState([]);
  const [respostesBarrejades, setRespostesBarrejades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    console.log("Conceptes seleccionats: ", conceptesSeleccionats);

    axios
      .get("http://localhost:8081/recuperarPreguntesPerConceptes", {
        params: { conceptesSeleccionats }, // Enviar l'array dels conceptes seleccionats
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
  }, [conceptesSeleccionats]); // Quan canviïn els conceptes seleccionats, s'actualitza

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
        <h1>Qüestionari de Pràctica</h1>

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

        <div className={styles.botoAnterior}>
          <button onClick={anarAnterior}>Anterior</button>
          <button onClick={anarSeguent}>
            {currentIndex === preguntes.length - 1
              ? "Veure resultats"
              : "Següent"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestLayout;
