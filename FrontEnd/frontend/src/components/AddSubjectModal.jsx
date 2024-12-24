import { useState } from "react";
import styles from "./StyleComponents/ProfessorDashboard.module.css";
import PropTypes from "prop-types";
import axios from "axios";

function AddSubjectModal({ id_User, onClose }) {
  const [subject_Name, setSubject_Name] = useState("");
  const [id_Subject, setIdSubject] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Per mostrar missatges d'error

  // Funció per enviar el formulari i registrar l'assignatura
  const handleSubmit = (e) => {
    e.preventDefault();

    const values = {
      id_User,
      id_Subject,
      subject_Name,
    };

    // Enviament de la sol·licitud per registrar l'assignatura
    axios
      .post("http://localhost:8081/registerSubject", values)
      .then((res) => {
        if (res.data.Status === "Failed") {
          setErrorMessage(res.data.Messages.join(", ")); // Mostrar missatges d'error
        } else {
          window.location.reload(); // Si tot va bé, recarregar
        }
      })
      .catch((err) => {
        console.error("Error en la sol·licitud:", err);
        setErrorMessage("Error al realitzar la sol·licitud.");
      });

    window.location.reload();
    onClose(); // Tancar el modal un cop enviat el formulari
  };

  return (
    <div className={styles.modalOver} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Add Subject</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Subject ID:</label>
            <input
              type="text"
              value={id_Subject}
              onChange={(e) => setIdSubject(e.target.value)}
              placeholder="Ex: 1234"
              required
              pattern="^\d{4}$"
              title="ID needs 4 digits"
              minLength={4}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Name of the Subject:</label>
            <input
              type="text"
              value={subject_Name}
              onChange={(e) => setSubject_Name(e.target.value)}
              placeholder="Ex: Math"
              required
              pattern="^[A-Za-zÀ-ÿ\s]+$"
            />
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>
              <p>{errorMessage}</p>
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addButtonModal}>
              Add Subject
            </button>
            <button
              type="button"
              className={styles.cancelButtonModal}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddSubjectModal.propTypes = {
  id_User: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddSubjectModal;
