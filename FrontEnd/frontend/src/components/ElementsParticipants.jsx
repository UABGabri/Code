import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css";
import { FaArrowLeft, FaArrowRight, FaInfo } from "react-icons/fa6";

function ElementsParticipants({ Id_Assignatura, Role_User }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [newNiu, setNewNiu] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filter, setFilter] = useState("");

  //Funció de recuperació dels participants
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

  const [deleteModal, setDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  //Funció per obrir modal d'eliminació
  const handleOpenModal = (niu) => {
    setDeleteModal(true);
    setUserToDelete(niu);
  };

  // Funció per tancar el modal d'eliminació
  const handleCloseModal = () => {
    setDeleteModal(false);
  };

  const handleOpenInformation = (user) => {
    setInfoModal(true);

    setUserInfo(user);
  };

  //Funció d'eliminació dels participants
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

    handleCloseModal();
  };

  //Funció d'afegir els participants a l'assignatura
  const handleCsvUpload = async () => {
    if (!csvFile) return alert("Selecciona un fitxer CSV primer!");

    const fileName = csvFile.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();
    if (fileExtension !== "csv") {
      return alert(
        "El fitxer seleccionat no és un fitxer CSV. Si us plau, tria un fitxer amb extensió .csv"
      );
    }

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
        //console.log(response.data);
        alert("Importació completada correctament!");
        setUsers(response.data.participants); // Actualitzar la llista d'usuaris amb les noves dades
      } else {
        alert("Error a la importació: " + response.data.message);
      }
    } catch (err) {
      console.error("Error a la importació del fitxer CSV:", err);
      alert("Hi ha hagut un error a la importació del fitxer.");
    }
  };

  //Funció afegir participant individual
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
                    //console.log(addRes);
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

  // Filtratge de participants pel nom
  const filteredUsers = users.filter((user) => {
    return user.username.toLowerCase().includes(filter.toLowerCase()); // Filtra per nom
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <div className={styles.participantContainer}>
        <strong className={styles.elementsCursHeader}>
          GESTIÓ DE PARTICIPANTS
        </strong>
        <div style={{ marginBottom: "10px", gap: "30px" }}>
          <label style={{ marginRight: "10px" }}>Filtrar per Nom: </label>
          <input
            type="text"
            placeholder="Filtrar per nom"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterInput}
          />
        </div>

        {displayedUsers.length > 0 ? (
          displayedUsers.map((user) => (
            <div key={user.niu} className={styles.participantCard}>
              <div className={styles.participantDetails}>
                <p>
                  <strong>Nom:</strong> {user.username}
                </p>

                <p>
                  <strong>Email:</strong> <a href="">{user.email}</a>
                </p>
                <p>
                  <strong>Rol: </strong> {user.role}
                </p>
              </div>

              <div
                onClick={() => handleOpenInformation(user)}
                style={{ marginTop: "80px" }}
              >
                <FaInfo />
              </div>

              {Role_User !== "alumne" && (
                <div
                  className={styles.deleteButtonParticipant}
                  onClick={() => handleOpenModal(user.niu)}
                >
                  Eliminar
                </div>
              )}

              {infoModal && userInfo && (
                <div
                  key={userInfo.niu}
                  className={styles.modalInformation}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setInfoModal(false);
                    }
                  }}
                >
                  <div className={styles.modalInformationUser}>
                    <p>
                      <strong>Nom:</strong> {userInfo.username}
                    </p>
                    <p>
                      <strong>NIU:</strong> {userInfo.niu}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href={`mailto:${userInfo.email}`}>{userInfo.email}</a>
                    </p>
                    <p>
                      <strong>Rol: </strong> {userInfo.role}
                    </p>

                    {Role_User === "professor" && (
                      <p>
                        <strong>
                          Nota Global Assignatura:{" "}
                          {(userInfo.notes / 10 || 0.0).toFixed(2)}{" "}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {deleteModal && (
                <div className={styles.modalEliminateParticipant}>
                  <div className={styles.modalContentEliminateParticipant}>
                    <h3>Segur que vols eliminar a aquest alumne?</h3>
                    <div className={styles.modalActions}>
                      <button
                        onClick={() =>
                          handleEliminateParticipant(userToDelete, user.role)
                        }
                      >
                        Si
                      </button>
                      <button onClick={handleCloseModal}>No</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noAtendeesMessage}>
            <strong style={{ color: "red" }}>No Atendees </strong>
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{ background: "none" }}
            >
              <FaArrowLeft />
            </button>
            <span>
              Pàgina {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{ background: "none" }}
            >
              <FaArrowRight />
            </button>
          </div>
        )}

        {Role_User !== "alumne" && (
          <>
            <div className={styles.addParticipants}>
              <button
                onClick={() => setShowModal(true)}
                className={styles.addParticipantButton}
                style={{ marginBottom: "10px" }}
              >
                Afegir participant
              </button>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.modalBackdropParticipant}>
          <div className={styles.modalContentParticipant}>
            <div>
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
                <button
                  onClick={handleAddParticipant}
                  style={{ backgroundColor: "green", color: "white" }}
                >
                  Afegir
                </button>
                <button
                  style={{ backgroundColor: "red", color: "white" }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel·lar
                </button>
              </div>

              <hr></hr>
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
                  style={{ marginTop: "10px" }}
                >
                  Importar CSV
                </button>
              </div>
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
