import { useState, useEffect } from "react";
import styles from "./StyleComponents/AddQuestionsStyle.module.css";
import Headercap from "./Headercap";
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";

function AddQuestion() {
  const location = useLocation();
  const { Id_User, Id_Assignatura } = location.state;
  const [errors, setFormErrors] = useState("");
  const navigate = useNavigate();
  const [temes, setTemes] = useState([]);
  const [selectedTema, setSelectedTema] = useState();
  const [values, setValues] = useState({
    conceptes_materia: "",
    dificultat: "",
    pregunta: "",
    solucio_correcta: "",
    estat: "pendent",
    erronea_1: "",
    erronea_2: "",
    erronea_3: "",
    id_creador: Id_User,
    id_tema: selectedTema,
  });

  const [extraOptionsVisible, setExtraOptionsVisible] = useState(false);
  const [extraOptionsVisible2, setExtraOptionsVisible2] = useState(false);
  const [addButtonOption, setAddButtonOption] = useState(true);

  const history = useNavigate();

  const updateField = (fieldName, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8081/addQuestion", values);
      console.log("Resposta del servidor:", res.data);

      if (res.data.Status === "Failed") {
        setFormErrors(res.data.Message || "No s'ha pogut afegir la pregunta.");
      } else {
        alert("Pregunta afegida correctament!");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error a la sol·licitud:", error);
      setFormErrors("Hi ha hagut un error en enviar la sol·licitud.");
    }
  };

  const recoverTemasAssignatura = () => {
    axios
      .get("http://localhost:8081/recoverTemasAssignatura", {
        params: { Id_Assignatura },
      })
      .then((res) => {
        console.log("Resposta servidor:", res.data);
        setTemes(res.data);
      });
  };

  useEffect(() => {
    if (Id_Assignatura) {
      recoverTemasAssignatura();
    }
  }, [Id_Assignatura]);

  // Función para manejar la adición de opciones
  const handleAddOptions = () => {
    if (!extraOptionsVisible) {
      setExtraOptionsVisible(true);
    } else if (!extraOptionsVisible2) {
      setExtraOptionsVisible2(true);
      setAddButtonOption(false);
    }
  };

  // Funciones para eliminar opciones
  const handleRemoveOption2 = () => {
    setExtraOptionsVisible(false);
    setAddButtonOption(true);
    updateField("erronea_2", "");
  };

  const handleRemoveOption3 = () => {
    setExtraOptionsVisible2(false);
    setAddButtonOption(true);
    updateField("erronea_3", "");
  };

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
                updateField("id_tema", e.target.value);
              }}
              placeholder="Selecciona un tema"
              className={styles.selectInput}
              required
            >
              <option value="" required>
                Selecciona un Tema:
              </option>
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
              id="conceptes_materia"
              name="conceptes_materia"
              value={values.conceptes_materia}
              onChange={(e) => updateField("conceptes_materia", e.target.value)}
              placeholder="Conceptes separats per comes"
              required
              pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
              className={styles.selectInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dificultat">Dificultat:</label>
            <select
              id="dificultat"
              name="dificultat"
              value={values.dificultat}
              onChange={(e) => updateField("dificultat", e.target.value)}
              className={styles.selectInput}
              required
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
                onChange={(e) => updateField("pregunta", e.target.value)}
                className={styles.textarea}
                placeholder="Insereix la teva pregunta"
                required
                pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                maxLength={200}
              />
            </div>
          </div>

          <div>
            <div>
              <div className={styles.formGroup}>
                <label htmlFor="solucio">Solució:</label>
                <input
                  type="text"
                  id="solucio"
                  name="solucio"
                  value={values.solucio}
                  onChange={(e) =>
                    updateField("solucio_correcta", e.target.value)
                  }
                  placeholder="Solució correcta"
                  required
                  pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                  className={styles.selectInput}
                />
              </div>
            </div>

            <div className={styles.wrongArea}>
              <div className={styles.formGroup}>
                <label htmlFor="erronea_1">Opció erronea:</label>
                <input
                  type="text"
                  id="erronea_1"
                  name="erronea_1"
                  value={values.erronea_1}
                  onChange={(e) => updateField("erronea_1", e.target.value)}
                  required
                  pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                  className={styles.optionInput}
                  placeholder="Solució erronea"
                />
              </div>

              {addButtonOption && (
                <button
                  type="button"
                  onClick={handleAddOptions}
                  className={styles.addOptionButton}
                >
                  <FaPlus />
                </button>
              )}

              {extraOptionsVisible && (
                <div className={styles.formGroup}>
                  <label htmlFor="erronea_2">Opció erronea: 2</label>
                  <input
                    type="text"
                    id="erronea_2"
                    name="erronea_2"
                    value={values.erronea_2}
                    onChange={(e) => updateField("erronea_2", e.target.value)}
                    pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                    className={styles.optionInput}
                    placeholder="Solució erronea"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveOption2}
                    className={styles.removeOptionButton}
                  >
                    <FaMinus />
                  </button>
                </div>
              )}

              {extraOptionsVisible2 && (
                <div className={styles.formGroup}>
                  <label htmlFor="erronea_3">Opció erronea: 3</label>
                  <input
                    type="text"
                    id="erronea_3"
                    name="erronea_3"
                    value={values.erronea_3}
                    onChange={(e) => updateField("erronea_3", e.target.value)}
                    pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
                    className={styles.optionInput}
                    placeholder="Solució erronea"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveOption3}
                    className={styles.removeOptionButton}
                  >
                    <FaMinus />
                  </button>
                </div>
              )}
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

export default AddQuestion;
