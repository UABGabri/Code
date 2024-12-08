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
  }, [idAssignatura, users]);

  const handleEliminateParticipant = (niu, role) => {
    if (role === "professor") {
      axios
        .delete("http://localhost:8081/eliminateTeacher", {
          params: { id: niu, idAssignatura },
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
    } else if (role === "alumne") {
      axios
        .delete("http://localhost:8081/eliminateStudent", {
          params: { id: niu, idAssignatura },
        })
        .then((res) => {
          if (Array.isArray(res.data)) {
            setUsers(res.data);
          } else {
            alert("Error al actualitzar la llista de participants.");
          }
        })
        .catch((err) => {
          console.error("Error a la solicitud:", err);
        });
    } else {
      alert("Error al eliminar el participant.");
    }
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
          let checkEndpoint = "";

          if (role === "professor") {
            checkEndpoint = "http://localhost:8081/checkProfessorInSubject";
          } else {
            checkEndpoint = "http://localhost:8081/checkStudentInSubject";
          }

          axios
            .get(checkEndpoint, {
              params: { niu: newNiu, idAssignatura },
            })
            .then((checkRes) => {
              if (checkRes.data.exists) {
                alert(
                  "Aquest participant ja està registrat en aquesta assignatura!"
                );
              } else {
                let endpoint = "";

                if (role === "professor") {
                  endpoint = "http://localhost:8081/addProfessorToSubject";
                } else {
                  endpoint = "http://localhost:8081/addStudentToSubject";
                }

                axios
                  .post(endpoint, {
                    niu: newNiu,
                    idAssignatura,
                  })
                  .then((addRes) => {
                    setUsers(addRes.data);
                    setShowModal(false);
                    setNewNiu("");
                    alert("Participant afegit correctament!");
                    window.location.reload();
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
            <div
              className={styles.deleteButtonParticipant}
              onClick={() => handleEliminateParticipant(user.niu, user.role)}
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
