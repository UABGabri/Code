import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css";

function ElementsParticipants({ Id_Assignatura, Role_User }) {
  const [users, setUsers] = useState([]);
  const [usersGrades, setUsersGrades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newNiu, setNewNiu] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverAtendees", {
        params: { Id_Assignatura },
      })
      .then((res) => {
        console.log(res);
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

  const handleCsvUpload = async () => {
    if (!csvFile) return alert("Selecciona un fitxer CSV primer!");

    const formData = new FormData();
    formData.append("file", csvFile);

    const idAssignatura = Id_Assignatura;
    formData.append("Id_Assignatura", idAssignatura);

    try {
      const response = await axios.post(
        "http://localhost:8081/import-csv",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.status === "success") {
        console.log(response.data);
        alert("Importació completada correctament!");
        setUsers(response.data.participants); // Actualitzar la llista d'usuaris amb les noves dades

        //window.location.reload();
      } else {
        alert("Error a la importació: " + response.data.message);
      }
    } catch (err) {
      console.error("Error a la importació del fitxer CSV:", err);
      alert("Hi ha hagut un error a la importació del fitxer.");
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
                    console.log(addRes);
                    setUsers(addRes.data.resultSelect);
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
        <strong className={styles.elementsCursHeader}>
          GESTIÓ DE PARTICIPANTS
        </strong>
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.niu} className={styles.participantCard}>
              <div className={styles.participantDetails}>
                <p>
                  <strong>Nom:</strong> {user.username}
                </p>
                <p>
                  <strong>NIU:</strong> {user.niu}
                </p>
                <p>
                  <strong>Email:</strong> <a href="">{user.email}</a>
                </p>
                <p>
                  <strong>Rol: </strong> {user.role}
                </p>
                <p>
                  <strong>Nota Assignatura: </strong> {user.notes}
                </p>
              </div>

              {Role_User !== "alumne" && (
                <div
                  className={styles.deleteButtonParticipant}
                  onClick={() =>
                    handleEliminateParticipant(user.niu, user.role)
                  }
                >
                  Eliminar
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noAtendeesMessage}>
            <strong style={{ color: "red" }}>No Atendees </strong>
          </div>
        )}

        {Role_User !== "alumne" && (
          <>
            <div className={styles.addParticipants}>
              <div>
                <h2>Importar usuaris amb fitxer CSV</h2>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />
                <button
                  onClick={handleCsvUpload}
                  className={styles.addParticipantButton}
                >
                  Importar CSV
                </button>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className={styles.addParticipantButton}
              >
                Afegir participant
              </button>
            </div>
          </>
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
