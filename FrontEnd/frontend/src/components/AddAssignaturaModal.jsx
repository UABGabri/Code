import { useState } from "react";
import styles from "./ProfessorDashboard.module.css";
import PropTypes from "prop-types";
import axios from "axios";

function AddAssignaturaModal({ onClose }) {
  const [nomAssignatura, setNomAssignatura] = useState("");
  const [idAssignatura, setIdAssignatura] = useState("");
  const [niuAlumnes, setNiuAlumnes] = useState("");
  const [niuProfessors, setNiuProfessors] = useState("");
  // const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    /*
    e.preventDefault();
    if (!nomAssignatura || !idAssignatura || !niuAlumnes) {
      alert("Per favor, completa tots els camps.");
      return;
    }
*/
    try {
      const niuArrayAlumnes = niuAlumnes.split(",").map((niu) => niu.trim());
      const niuArrayProfessors = niuProfessors
        .split(",")
        .map((niu) => niu.trim());

      const values = {
        idAssignatura,
        nomAssignatura,
        niuArrayProfessors,
        niuArrayAlumnes,
      };

      axios
        .post("http://localhost:8081/registerSubject", values) //trucada post al servidor amb els valors introduits al obj values
        .then((res) => {
          console.log("Resposta del servidor:", res.data);
        })
        .catch((err) => {
          console.error("Error a la solicitud:", err);
        });

      window.location.reload();
      onClose();
    } catch (error) {
      console.log("Error afegir assignatura", error);
      onClose();
    }
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
            <label>NIUs dels professors (separats per comes):</label>
            <input
              type="text"
              value={niuProfessors}
              onChange={(e) => setNiuProfessors(e.target.value)}
              placeholder="Ex: 1598407, 1432431"
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
