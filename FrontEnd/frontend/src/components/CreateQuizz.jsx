import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Headercap from "./Headercap";
import styles from "./StyleComponents/CreateQuizzLayout.module.css";
import { BiArrowBack } from "react-icons/bi";

function CreateQuizz() {
  const navigate = useNavigate();
  const location = useLocation();

  const [temes, setTemes] = useState([]);
  const [seleccions, setSeleccions] = useState([]);
  const [temaSeleccionat, setTemaSeleccionat] = useState("");
  const [numeroPreguntes, setNumeroPreguntes] = useState(1);
  const [dataFinalitzacio, setDataFinalitzacio] = useState(""); // Nou camp per a la data
  const { id_assignatura, id_professor, id_tema, tipus } = location.state || {};

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverTemasAssignatura", {
        params: { Id_Assignatura: id_assignatura },
      })
      .then((response) => setTemes(response.data))
      .catch((error) => console.error("Error al recuperar temes:", error));
  }, [id_assignatura]);

  const afegirTema = () => {
    if (!temaSeleccionat) return;
    const existeix = seleccions.find(
      (seleccio) => seleccio.id === parseInt(temaSeleccionat)
    );

    if (!existeix) {
      const tema = temes.find((t) => t.id_tema === parseInt(temaSeleccionat));
      setSeleccions((prev) => [
        ...prev,
        {
          id: tema.id_tema,
          nom_tema: tema.nom_tema,
          preguntes: numeroPreguntes,
        },
      ]);
      setTemaSeleccionat("");
      setNumeroPreguntes(1);
    }
  };

  const handleCreateQuizz = () => {
    const nomTest = prompt("Introdueix un nom pel test:");
    if (!nomTest || !dataFinalitzacio) {
      alert("El nom del test i la data de finalització són obligatoris.");
      return;
    }

    axios
      .post("http://localhost:8081/createQuizz", {
        seleccions,
        nom_test: nomTest,
        id_creador: id_professor,
        id_assignatura,
        id_tema,
        tipus,
        data_finalitzacio: dataFinalitzacio, // Enviem la data de finalització
      })
      .then((response) => {
        if (response.data.Status === "Test creat correctament") {
          alert(
            `Test creat correctament amb clau d'accés: ${response.data.clau_acces}`
          );
          navigate(-1);
        } else {
          alert("Error al crear el test.");
        }
      })
      .catch((error) => console.error("Error al crear el test:", error));
  };

  return (
    <div>
      <Headercap />
      <div className={styles.content}>
        <BiArrowBack
          onClick={() => navigate(-1)}
          className={styles.arrowBack}
        />
        <h2>Crear Quizz</h2>

        <div>
          <label>
            Data de Finalització:
            <input
              type="date"
              value={dataFinalitzacio}
              onChange={(e) => setDataFinalitzacio(e.target.value)}
            />
          </label>
        </div>

        <div className={styles.selectContainer}>
          <select
            value={temaSeleccionat}
            onChange={(e) => setTemaSeleccionat(e.target.value)}
          >
            <option value="">Selecciona un tema</option>
            {temes
              .filter(
                (tema) => !seleccions.some((sel) => sel.id === tema.id_tema)
              )
              .map((tema) => (
                <option key={tema.id_tema} value={tema.id_tema}>
                  {tema.nom_tema}
                </option>
              ))}
          </select>
          <input
            type="number"
            min="1"
            value={numeroPreguntes}
            onChange={(e) => setNumeroPreguntes(parseInt(e.target.value))}
          />
          <button onClick={afegirTema}>Afegir</button>
        </div>

        <ul className={styles.temesSeleccionats}>
          {seleccions.map((seleccio) => (
            <li key={seleccio.id} className={styles.temaSeleccionat}>
              <span>{seleccio.nom_tema} - Preguntes:</span>
              <input
                type="number"
                min="1"
                value={seleccio.preguntes}
                onChange={(e) =>
                  setSeleccions((prev) =>
                    prev.map((sel) =>
                      sel.id === seleccio.id
                        ? { ...sel, preguntes: parseInt(e.target.value) }
                        : sel
                    )
                  )
                }
              />
              <button
                onClick={() =>
                  setSeleccions((prev) =>
                    prev.filter((sel) => sel.id !== seleccio.id)
                  )
                }
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>

        <button onClick={handleCreateQuizz}>Crear Test</button>
      </div>
    </div>
  );
}

export default CreateQuizz;
