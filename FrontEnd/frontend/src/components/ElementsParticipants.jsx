import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css";

function ElementsParticipants({ idAssignatura }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newNiu, setNewNiu] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverAtendees", {
        params: { idAssignatura },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  }, [idAssignatura]);

  const handleEliminateParticipant = (niu) => {
    axios
      .delete("http://localhost:8081/eliminateAtendee", {
        params: { id: niu },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  };

  const handleAddParticipant = () => {
    if (!newNiu) return alert("Has d'introduir un NIU!");

    axios
      .get("http://localhost:8081/checkUserExists", {
        params: { niu: newNiu },
      })
      .then((res) => {
        if (res.data.exists) {
          axios
            .post("http://localhost:8081/addAtendee", {
              niu: newNiu,
              idAssignatura,
            })
            .then((res) => {
              setUsers(res.data);
              setShowModal(false);
              setNewNiu("");
              alert("Participant afegit correctament!");
            })
            .catch((err) => {
              console.error("Error a l'afegir el participant:", err);
              alert("Hi ha hagut un error al afegir el participant.");
            });
        } else {
          alert("Aquest NIU no existeix a la base de dades d'usuaris!");
        }
      })
      .catch((err) => {
        console.error("Error a la verificació del NIU:", err);
        alert("Hi ha hagut un error al verificar el NIU.");
      });
  };

  return (
    <div>
      <div className={styles.participantContainer}>
        {users.map((user) => (
          <div key={user.niu} className={styles.participantCard}>
            <div className={styles.participantDetails}>
              <p>
                <strong>Nom:</strong> {user.username}
              </p>
              <p>
                <strong>NIU:</strong> {user.niu}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
            <div
              className={styles.deleteButton}
              onClick={() => handleEliminateParticipant(user.niu)}
            >
              Eliminar
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowModal(true)}
          className={styles.addParticipantButton}
        >
          Afegir participant
        </button>
      </div>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h2>Afegir Participant</h2>
            <label htmlFor="niu">NIU de l'usuari:</label>
            <input
              type="text"
              id="niu"
              value={newNiu}
              onChange={(e) => setNewNiu(e.target.value)}
              className={styles.inputField}
            />
            <div className={styles.modalActions}>
              <button onClick={handleAddParticipant}>Afegir</button>
              <button onClick={() => setShowModal(false)}>Cancel·lar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ElementsParticipants.propTypes = {
  idAssignatura: PropTypes.string.isRequired,
};

export default ElementsParticipants;
