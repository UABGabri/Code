import styles from "./Elements.module.css";
import PropTypes from "prop-types";
import axios from "axios";
import { useState, useEffect } from "react";

function ElementsTests({ idAssignatura }) {
  const [temes, setTemes] = useState([]);
  const [selectedTema, setSelectedTema] = useState();

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

  const handleSubmit = () => {};
  return (
    <div>
      <div className={styles.quizzContainerTitle}>
        <h1>GENERADOR DE TESTS</h1>
        <div className={styles.quizzContainerBody}>
          <form onSubmit={handleSubmit()}>
            <label htmlFor="tema">Tema:</label>
            <select
              id="tema"
              name="id_tema"
              value={selectedTema}
              onChange={(e) => {
                setSelectedTema(e.target.value);
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
          </form>
        </div>
      </div>
    </div>
  );
}

ElementsTests.propTypes = {
  idAssignatura: PropTypes.string.isRequired,
};
export default ElementsTests;
