import { useState } from "react";
import styles from "./StyleComponents/DashboardStyle.module.css";
import PropTypes from "prop-types";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

function AddSubjectModal({ id_User, onClose }) {
  axios.defaults.withCredentials = true;
  const [subject_Name, setSubject_Name] = useState("");
  const [id_Subject, setIdSubject] = useState("");
  const [passwordSubject, setPasswordSubject] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Per mostrar missatges d'error

  // Funció per enviar el formulari i registrar l'assignatura
  const handleSubmit = (e) => {
    e.preventDefault();

    const values = {
      id_User,
      id_Subject,
      subject_Name,
      passwordSubject,
    };

    axios
      .post(`${apiUrl}/registerSubject`, values)
      .then((res) => {
        if (res.data.Status === "Failed") {
          alert(res.data.Messages);
        } else {
          alert("Assignatura afegida correctament");
          window.location.reload(); // Si tot va bé, recarregar
        }
      })
      .catch((err) => {
        console.error("Error en la sol·licitud:", err);
        setErrorMessage("Error al realitzar la sol·licitud.");
      });

    onClose(); // Tancar el modal un cop enviat el formulari
  };

  return (
    <div className={styles.modalOver} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Afegir Assignatura</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>ID de l'Assignatura:</label>
            <input
              type="text"
              value={id_Subject}
              onChange={(e) => setIdSubject(e.target.value)}
              placeholder="Ex: 1234"
              required
              pattern="^\d{4}$"
              title="L'ID necessita 4 dígits"
              maxLength={4}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Nom de l'Assignatura:</label>
            <input
              type="text"
              value={subject_Name}
              onChange={(e) => setSubject_Name(e.target.value)}
              placeholder="Ex: Matemàtiques"
              required
              maxLength={15}
              title="Només caràcters alfabètics."
              pattern="^[A-Za-zÀ-ÿ\s]+$"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contrasenya:</label>
            <input
              type="password"
              value={passwordSubject}
              onChange={(e) => setPasswordSubject(e.target.value)}
              required
              maxLength={10}
              pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
              title="Només caràcters alfabètics i numèrics."
            />
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>
              <p>{errorMessage}</p>
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addButtonModal}>
              Afegir Assignatura
            </button>
            <button
              type="button"
              className={styles.cancelButtonModal}
              onClick={onClose}
            >
              Cancel·lar
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
