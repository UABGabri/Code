import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import AddSubjectModal from "./AddSubjectModal";
import styles from "./StyleComponents/DashboardStyle.module.css";
import Headercap from "./Headercap";
import axios from "axios";

function Dashboard({ id_User, role_User }) {
  const [assignatures, setAssignatures] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const navigate = useNavigate();

  const fetchAssignatures = async () => {
    try {
      const res = await axios.post("http://localhost:8081/recoverSubjects", {
        idUser: id_User,
        roleUser: role_User,
      });

      return res.data;
    } catch (err) {
      console.error("Error in request:", err);
      return [];
    }
  };

  useEffect(() => {
    if (id_User && role_User) {
      fetchAssignatures().then((data) => {
        setAssignatures(data);
      });
    } else {
      console.error("id_User or role_User is not defined");
    }
  }, [id_User, role_User]);

  const openAddModal = () => {
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
  };

  const openDeleteModal = () => {
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
    setConfirmDelete(false);
    setDeleteId("");
  };

  const handleDeleteSubject = async () => {
    console.log(deleteId);
    try {
      await axios.delete("http://localhost:8081/deleteSubject", {
        params: { id_subject: deleteId },
      });

      setAssignatures((prev) =>
        prev.filter((assignatura) => assignatura.id_assignatura !== deleteId)
      );
      closeDeleteModal();
      alert("Assignatura eliminada correctament!");
      window.location.reload();
    } catch (err) {
      console.error("Error eliminant l'assignatura:", err);
      alert("No s'ha pogut eliminar l'assignatura.");
    }
  };

  const handleSelectAssignatura = (id, name) => {
    navigate(`/assignatura/${id}`, { state: { name, id, id_User, role_User } });
  };

  const leftColumn = assignatures.filter((_, index) => index % 2 === 0);
  const rightColumn = assignatures.filter((_, index) => index % 2 !== 0);

  return (
    <div>
      <Headercap />
      <div className={styles.title}>
        <h1>LES TEVES ASSIGNATURES</h1>
      </div>

      <div className={styles.container}>
        <div className={styles.columnsContainer}>
          <div className={styles.left}>
            {leftColumn.map((assignatura) => (
              <div
                key={assignatura.id_assignatura}
                className={styles.assignaturaCard}
                onClick={() =>
                  handleSelectAssignatura(
                    assignatura.id_assignatura,
                    assignatura.nom_assignatura
                  )
                }
              >
                <h3>{assignatura.nom_assignatura}</h3>
                <p>ID: {assignatura.id_assignatura}</p>
              </div>
            ))}
          </div>

          <div className={styles.right}>
            {rightColumn.map((assignatura) => (
              <div
                key={assignatura.id_assignatura}
                className={styles.assignaturaCard}
                onClick={() =>
                  handleSelectAssignatura(
                    assignatura.id_assignatura,
                    assignatura.nom_assignatura
                  )
                }
              >
                <h3>{assignatura.nom_assignatura}</h3>
                <p>ID: {assignatura.id_assignatura}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.buttonsContainer}>
          {role_User === "professor" && (
            <button onClick={openAddModal} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}

          {role_User === "professor" && (
            <button onClick={openDeleteModal} className={styles.deleteButton}>
              Eliminar Assignatura
            </button>
          )}
        </div>
      </div>

      {addModal && (
        <AddSubjectModal id_User={id_User} onClose={closeAddModal} />
      )}

      {deleteModal && (
        <div className={styles.modalOver}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Eliminar Assignatura</h2>

            <form
              className={styles.modalForm}
              onSubmit={(e) => {
                e.preventDefault();
                if (/^\d{4}$/.test(deleteId)) {
                  setConfirmDelete(true);
                } else {
                  alert(
                    "Si us plau, introdueix un ID d'assignatura vàlid de 4 dígits."
                  );
                }
              }}
            >
              {!confirmDelete ? (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="deleteId">
                      Introdueix l'ID de l'assignatura:
                    </label>
                    <input
                      type="text"
                      id="deleteId"
                      value={deleteId}
                      required
                      pattern="^\d{4}$"
                      title="L'ID necessita 4 dígits"
                      minLength={4}
                      onChange={(e) => setDeleteId(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>
                  <div className={styles.buttonDeleteModal}>
                    <button type="submit" className={styles.addButtonModal}>
                      Acceptar
                    </button>
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      className={styles.cancelButtonModal}
                    >
                      Cancel·lar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>Estàs segur que vols eliminar aquesta assignatura?</p>
                  <div className={styles.modalActions}>
                    <div className={styles.buttonDeleteModal}>
                      <button
                        type="button"
                        onClick={handleDeleteSubject}
                        className={styles.addButtonModal}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={closeDeleteModal}
                        className={styles.cancelButtonModal}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

Dashboard.propTypes = {
  id_User: PropTypes.number.isRequired,
  role_User: PropTypes.string.isRequired,
};

export default Dashboard;
