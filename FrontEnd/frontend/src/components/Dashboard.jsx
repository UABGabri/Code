import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import AddSubjectModal from "./AddSubjectModal";
import styles from "./StyleComponents/DashboardStyle.module.css";
import Headercap from "./Headercap";
import axios from "axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

const apiUrl = import.meta.env.VITE_API_URL2;

function Dashboard({ id_User, role_User }) {
  const [assignatures, setAssignatures] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [accessModal, setAccessModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [accessId, setAccessId] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  //Funció auxiliar per la obtenció de tota la informació de les assignatures relacionades amb un usuari.
  const fetchAssignatures = async () => {
    try {
      const res = await axios.post(`${apiUrl}/recoverSubjects`, {
        idUser: id_User,
        roleUser: role_User,
      });

      if (res.data.Status === "Success") {
        return res.data.result;
      } else {
        setError("Error al recuperar les assignatures.");
      }
    } catch (err) {
      console.error("Error en la sol·licitud:", err);
      return [];
    }
  };

  //Funció d'obtenció de les assignatures i informació inicial.
  useEffect(() => {
    if (id_User && role_User) {
      fetchAssignatures().then((data) => {
        setAssignatures(data);
      });

      console.log(assignatures);
    } else {
      console.error("id_User or role_User no està definit");
    }
  }, [id_User, role_User]);

  //Funcions auxiliar obrir i tancar els modals.
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

  const openAccessModal = () => {
    setAccessModal(true);
  };

  const closeAccessModal = () => {
    setAccessModal(false);
  };

  const handleAccessSubject = async () => {
    if (!accessId || !accessPassword) return alert("Manquen dades");

    try {
      const res = await axios.post(`${apiUrl}/accessSubject`, {
        id_User,
        id_Subject: accessId,
        accessPassword,
        userRole: role_User,
      });

      if (res.data.success) {
        alert(res.data.Messages);
      } else {
        alert(res.data.Messages);
      }

      closeAccessModal();

      window.location.reload();
    } catch (err) {
      console.error("Error eliminant l'assignatura:", err);
      alert("No s'ha pogut eliminar l'assignatura.");
    }
  };
  //Funció asíncrona per esborrar assignatures. Es fa de forma asíncrona per qüestió del CASCADE.
  const handleDeleteSubject = async () => {
    if (
      !assignatures.some(
        (assignatura) => assignatura.id_assignatura === parseInt(deleteId)
      )
    ) {
      alert("No pots eliminar una assignatura on no estiguis matriculat");
      return;
    }

    try {
      const res = await axios.delete(`${apiUrl}/deleteSubject`, {
        params: { id_subject: deleteId, password: accessPassword },
      });

      if (res.data.success) {
        alert(res.data.message);
      } else {
        alert(res.data.message);
      }

      setAssignatures((prev) =>
        prev.filter((assignatura) => assignatura.id_assignatura !== deleteId)
      );

      closeDeleteModal();

      window.location.reload();
    } catch (err) {
      console.error("Error eliminant l'assignatura:", err);
      alert("No s'ha pogut eliminar l'assignatura.");
    }
  };

  //Funció de navegació de l'assignatura que l'usuari seleccioni.
  const handleSelectAssignatura = (id, name) => {
    navigate(`/assignatura/${id}`, { state: { name, id, id_User, role_User } });
  };

  //Apartat de paginació.
  const [currentPage, setCurrentPage] = useState(1);
  const assignaturesPerPage = 6;

  const indexOfLastAssignatura = currentPage * assignaturesPerPage;
  const indexOfFirstAssignatura = indexOfLastAssignatura - assignaturesPerPage;
  const currentAssignatures = assignatures.slice(
    indexOfFirstAssignatura,
    indexOfLastAssignatura
  );

  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(assignatures.length / assignaturesPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (error) {
    return <p>Error al retornar assignatures</p>;
  }

  return (
    <div>
      <Headercap />
      <div className={styles.title}>
        <strong>LES TEVES ASSIGNATURES</strong>
      </div>

      <div className={styles.container}>
        <div className={styles.columnsContainer}>
          {assignatures.length === 0 ? (
            <p className={styles.noAssignaturesMessage}>
              No hi ha assignatures disponibles.
            </p>
          ) : (
            currentAssignatures.map((assignatura) => (
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
            ))
          )}
        </div>

        <div className={styles.pagination}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pagination}
          >
            <FaArrowLeft />
          </button>

          <span className={styles.pageNumber}>Pàgina {currentPage}</span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === pageNumbers.length}
            className={styles.pagination}
          >
            <FaArrowRight />
          </button>
        </div>

        <div className={styles.buttonsContainer}>
          {role_User === "professor" && (
            <>
              <button onClick={openAddModal} className={styles.addButton}>
                Afegir Assignatura
              </button>

              <button
                onClick={openDeleteModal}
                className={styles.cancelButtonModal}
              >
                Eliminar Assignatura
              </button>
            </>
          )}
        </div>

        <button
          onClick={openAccessModal}
          className={styles.addButton}
          style={{ marginTop: "20px" }}
        >
          Accedir Assignatura
        </button>
      </div>

      {addModal && (
        <AddSubjectModal id_User={id_User} onClose={closeAddModal} />
      )}

      {accessModal && (
        <div className={styles.modalOver}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Accedir Assignatura</h2>

            <form
              className={styles.modalForm}
              onSubmit={(e) => {
                e.preventDefault();
                handleAccessSubject();
              }}
            >
              <div className={styles.formGroup}>
                <label htmlFor="accessId">
                  Introdueix l'ID de l'assignatura:
                </label>
                <input
                  type="text"
                  id="accessId"
                  value={accessId}
                  required
                  pattern="^\d{4}$"
                  title="L'ID necessita 4 dígits"
                  maxLength={4}
                  onChange={(e) => setAccessId(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password de l'assignatura:</label>
                <input
                  type="password"
                  id="password"
                  value={accessPassword}
                  required
                  maxLength={10}
                  onChange={(e) => setAccessPassword(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.buttonDeleteModal}>
                <button type="submit" className={styles.addButtonModal}>
                  Acceptar
                </button>
                <button
                  type="button"
                  onClick={closeAccessModal}
                  className={styles.cancelButtonModal}
                >
                  Cancel·lar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className={styles.modalOver}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Eliminar Assignatura</h2>

            <form
              className={styles.modalForm}
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmDelete(true);
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
                      maxLength={4}
                      onChange={(e) => setDeleteId(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="password">Password de l'assignatura:</label>
                    <input
                      type="password"
                      id="password"
                      value={accessPassword}
                      required
                      maxLength={10}
                      onChange={(e) => setAccessPassword(e.target.value)}
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
  id_User: PropTypes.number,
  role_User: PropTypes.string,
};

export default Dashboard;
