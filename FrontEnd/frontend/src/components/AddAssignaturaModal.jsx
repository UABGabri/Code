import { useState } from "react";
import styles from "./ProfessorDashboard.module.css";

function AddAssignaturaModal() {
  const [nomAssignatura, setNomAssignatura] = useState("");
  const [idAssignatura, setIdAssignatura] = useState("");
  const [niuAlumnes, setNiuAlumnes] = useState("");

  return (
    <div className={styles.modalOver}>
      <div>
        <form>
          <div>
            <label>ID de la assignatura:</label>
            <input
              type="text"
              value={idAssignatura}
              onChange={(e) => setIdAssignatura(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Nom de la assignatura:</label>
            <input
              type="text"
              value={nomAssignatura}
              onChange={(e) => setNomAssignatura(e.target.value)}
              required
            />
          </div>
          <div>
            <label>NIUs dels alumnes (separats per comes):</label>
            <input
              type="text"
              value={niuAlumnes}
              onChange={(e) => setNiuAlumnes(e.target.value)}
              required
            />
          </div>
          <button type="submit">Afegir Assignatura</button>
        </form>
        <button>Cancelar</button>
      </div>
    </div>
  );
}

export default AddAssignaturaModal;
