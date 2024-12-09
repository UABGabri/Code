import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css";

function ElementsParticipants({ Id_Assignatura, Role_User }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newNiu, setNewNiu] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverAtendees", {
        params: { Id_Assignatura },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  }, [Id_Assignatura]);

  const handleEliminateParticipant = (niu, role) => {
    const endpoint =
      role === "professor"
        ? "http://localhost:8081/eliminateTeacher"
        : "http://localhost:8081/eliminateStudent";

    axios
      .delete(endpoint, {
        params: { id: niu, Id_Assignatura },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          alert("Error al actualitzar la llista de participants.");
        }
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
          const role = res.data.role;
          const checkEndpoint =
            role === "professor"
              ? "http://localhost:8081/checkProfessorInSubject"
              : "http://localhost:8081/checkStudentInSubject";

          axios
            .get(checkEndpoint, {
              params: { niu: newNiu, Id_Assignatura },
            })
            .then((checkRes) => {
              if (checkRes.data.exists) {
                alert(
                  "Aquest participant ja està registrat en aquesta assignatura!"
                );
              } else {
                const endpoint =
                  role === "professor"
                    ? "http://localhost:8081/addProfessorToSubject"
                    : "http://localhost:8081/addStudentToSubject";

                axios
                  .post(endpoint, {
                    niu: newNiu,
                    Id_Assignatura,
                  })
                  .then((addRes) => {
                    setUsers(addRes.data);
                    setShowModal(false);
                    setNewNiu("");
                    alert("Participant afegit correctament!");
                  })
                  .catch((err) => {
                    console.error("Error a l'afegir el participant:", err);
                    alert("Hi ha hagut un error al afegir el participant.");
                  });
              }
            })
            .catch((err) => {
              console.error("Error a la verificació del participant:", err);
              alert(
                "Hi ha hagut un error al verificar si el participant ja està registrat."
              );
            });
        } else {
          alert("Aquest NIU no existeix a la base de dades d'usuaris!");
        }
      })
      .catch((err) => {
        console.error("Error a la verificació del NIU:", err);
        alert("Hi ha hagut un error al verificar el NIU.");
      });

    setShowModal(false);
  };

  return (
    <div>
      <div className={styles.participantContainer}>
        <h1>GESTIÓ DE PARTICIPANTS</h1>
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
              <p>
                <strong>Rol: </strong> {user.role}
              </p>
            </div>
            {Role_User !== "alumne" && (
              <div
                className={styles.deleteButtonParticipant}
                onClick={() => handleEliminateParticipant(user.niu, user.role)}
              >
                Eliminar
              </div>
            )}
          </div>
        ))}

        {Role_User !== "alumne" && (
          <button
            onClick={() => setShowModal(true)}
            className={styles.addParticipantButton}
          >
            Afegir participant
          </button>
        )}
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
  Id_Assignatura: PropTypes.string.isRequired,
  Role_User: PropTypes.string.isRequired,
};

export default ElementsParticipants;
