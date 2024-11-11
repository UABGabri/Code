import { useState, useEffect } from "react";
import styles from "./AfegirPregunta.module.css";
import Headercap from "./Headercap";
import PropTypes from "prop-types";
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";

function AfegirPregunta() {
  const location = useLocation();
  const { professorId, idAssignatura } = location.state;

  const [temes, setTemes] = useState([]);
  const [selectedTema, setSelectedTema] = useState("");

  const [values, setValues] = useState({
    conceptes: "",
    dificultat: "",
    pregunta: "",
    solucio: "",
    erronea_1: "",
    erronea_2: "",
    erronea_3: "",
    id_creador: professorId,
    id_tema: selectedTema,
  });

  const history = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const conceptesArray = values.conceptes
      .split(",")
      .map((concept) => concept.trim()); //conversió a Array

    const valors = {
      ...values,
      conceptes: JSON.stringify(conceptesArray), //transformació a JSOn
    };

    axios
      .post("http://localhost:8081/addQuestion", valors)
      .then((res) => {
        console.log("Resposta del servidor:", res.data);
      })
      .catch((err) => {
        console.error("Error a la solicitud:", err);
      });
    console.log(values);
  };

  const recoverTemasAssignatura = () => {
    axios
      .get("http://localhost:8081/recoverTemasAssignatura", {
        params: { idAssignatura },
      })
      .then((res) => {
        console.log("Resposta servidor:", res.data);
        setTemes(res.data);
      });
  };

  useEffect(() => {
    if (idAssignatura) {
      recoverTemasAssignatura();
    }
  }, [idAssignatura]);

  return (
    <div>
      <Headercap />

      <div className={styles.content}>
        <BiArrowBack onClick={() => history(-1)} className={styles.arrowBack} />

        <h1 className={styles.titleQuestion}>AFEGIR PREGUNTA</h1>

        <form onSubmit={handleSubmit} className={styles.addQuestionForm}>
          <div className={styles.formGroup}>
            <label htmlFor="tema">Tema:</label>
            <select
              id="tema"
              name="id_tema"
              value={selectedTema}
              onChange={(e) => {
                setSelectedTema(e.target.value);
                setValues((prevValues) => ({
                  ...prevValues,
                  id_tema: e.target.value,
                }));
              }}
              placeholder="Selecciona un tema"
            >
              <option value="">Selecciona un tema</option>
              {temes.map((tema) => (
                <option key={tema.id_tema} value={tema.id_tema}>
                  {tema.nom_tema}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="conceptes">Conceptes:</label>
            <input
              type="text"
              id="conceptes"
              name="conceptes"
              value={values.conceptes}
              onChange={handleChange}
              placeholder="Conceptes separats per comes"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dificultat">Dificultat:</label>
            <select
              id="dificultat"
              name="dificultat"
              value={values.dificultat}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="Fàcil">Fàcil</option>
              <option value="Mitjà">Mitjà</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>

          <div className={styles.questionArea}>
            <div className={styles.formGroup}>
              <label htmlFor="pregunta">Pregunta:</label>
              <textarea
                id="pregunta"
                name="pregunta"
                value={values.pregunta}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Introdueix la teva pregunta"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="solucio">Solució Correcta:</label>
            <input
              type="text"
              id="solucio"
              name="solucio"
              value={values.solucio}
              onChange={handleChange}
              placeholder="Introdueix la teva solució"
            />
          </div>

          <div className={styles.wrongArea}>
            <div className={styles.formGroup}>
              <label htmlFor="erronea_1">Solució Incorrecta 1:</label>
              <input
                type="text"
                id="erronea_1"
                name="erronea_1"
                value={values.erronea_1}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="erronea_2">Solució Incorrecta 2:</label>
              <input
                type="text"
                id="erronea_2"
                name="erronea_2"
                value={values.erronea_2}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="erronea_3">Solució Incorrecta 3:</label>
              <input
                type="text"
                id="erronea_3"
                name="erronea_3"
                value={values.erronea_3}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className={styles.sendButton}>
            AFEGIR
          </button>
        </form>
      </div>
    </div>
  );
}

export default AfegirPregunta;
