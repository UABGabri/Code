import { useState } from "react";
import styles from "./ProfessorDashboard.module.css";
import PropTypes from "prop-types";

function AddAssignaturaModal({ onClose }) {
  const [nomAssignatura, setNomAssignatura] = useState("");
  const [idAssignatura, setIdAssignatura] = useState("");
  const [niuAlumnes, setNiuAlumnes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onClose();
  };

  return (
    <div className={styles.modalOver} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>ID de la assignatura:</label>
            <input
              type="text"
              value={idAssignatura}
              onChange={(e) => setIdAssignatura(e.target.value)}
              placeholder="Ex: 1234"
              required
            />
          </div>
          <div>
            <label>Nom de la assignatura:</label>
            <input
              type="text"
              value={nomAssignatura}
              onChange={(e) => setNomAssignatura(e.target.value)}
              placeholder="Ex: Matemàtiques"
              required
            />
          </div>
          <div>
            <label>NIUs dels alumnes (separats per comes):</label>
            <input
              type="text"
              value={niuAlumnes}
              onChange={(e) => setNiuAlumnes(e.target.value)}
              placeholder="Ex: 1598407, 1432431"
              required
            />
          </div>
          <button type="submit" className={styles.addButtonModal}>
            Afegir Assignatura
          </button>

          <button className={styles.addButtonModal} onClick={onClose}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

AddAssignaturaModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
export default AddAssignaturaModal;
