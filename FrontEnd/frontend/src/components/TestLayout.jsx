import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./StyleComponents/TestLayout.module.css";

const apiUrl = import.meta.env.VITE_API_URL;

function TestLayout() {
  const location = useLocation();
  const { conceptesSeleccionats } = location.state.parametersTest;
  const { idAssignatura } = location.state.idAssignatura;

  const history = useNavigate();
  const [preguntes, setPreguntes] = useState([]);
  const [respostesBarrejades, setRespostesBarrejades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    axios
      .get(`${apiUrl}/recoverQuestionsConcepts`, {
        params: { conceptesSeleccionats, idAssignatura },
      })
      .then((response) => {
        if (response.data.Status === "Success") {
          setPreguntes(response.data.Preguntes);
          setRespostesBarrejades(
            response.data.Preguntes.map((pregunta) =>
              barrejarRespostes(pregunta)
            )
          );
          setLoading(false);
        } else {
          history(-1);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [conceptesSeleccionats]);

  // Filtra les respostes buides abans de barrejarlas
  const barrejarRespostes = (pregunta) => {
    const respostes = [
      pregunta.solucio_correcta,
      pregunta.solucio_erronia1,
      pregunta.solucio_erronia2,
      pregunta.solucio_erronia3,
    ];

    // Filtra les respostes buides
    const respostesNoBuides = respostes.filter(
      (resposta) => resposta.trim() !== ""
    );

    // Baralla les respostes no buides
    return respostesNoBuides.sort(() => Math.random() - 0.5);
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

    // Modal dels resultats finals
    return (
      <div className={styles.containerQuizz}>
        <div className={styles.resultsBox}>
          <h1>Resultats</h1>
          <p>Correctes: {correctes}</p>
          <p>Incorrectes: {incorrectes}</p>
          <p>Nota: {percentatge}%</p>
          <div>
            <button
              className={styles.endButtons}
              onClick={() => window.location.reload()}
            >
              Reiniciar
            </button>
          </div>
          <button className={styles.endButtons} onClick={() => history(-1)}>
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
        <h1>Qüestionari</h1>
        <p className={styles.pregunta}>
          {preguntes[currentIndex].pregunta.length > 100
            ? preguntes[currentIndex].pregunta.slice(0, 70) + "..."
            : preguntes[currentIndex].pregunta}
        </p>
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
        <button onClick={() => history(-1)}>
          Tornar a la pàgina principal
        </button>
      </div>
    </div>
  );
}

export default TestLayout;
