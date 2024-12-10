import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import AddAssignaturaModal from "./AddAssignaturaModal";
import styles from "./StyleComponents/ProfessorDashboard.module.css";
import Headercap from "./Headercap";
import axios from "axios";

function ProfessorDashboard({ id_User, role_User }) {
  const [assignatures, setAssignatures] = useState([]);
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();

  // Función para recuperar asignaturas dependiendo del rol
  const fetchAssignatures = async () => {
    try {
      const res = await axios.post("http://localhost:8081/recoverSubjects", {
        idUser: id_User,
        roleUser: role_User,
      });
      return res.data;
    } catch (err) {
      console.error("Error a la solicitud:", err);
      return [];
    }
  };

  // Recuperar asignaturas al cargar el componente
  useEffect(() => {
    if (id_User && role_User) {
      fetchAssignatures().then((data) => {
        setAssignatures(data);
      });
    }
  }, [id_User, role_User]);

  // Abrir y cerrar el modal de añadir asignatura
  const openModal = () => {
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
  };

  // Navegar a una asignatura seleccionada
  const handleSelectAssignatura = (id, name) => {
    navigate(`/assignatura/${id}`, { state: { name, id, id_User, role_User } });
  };

  // Dividir las asignaturas en columnas
  const leftColumn = assignatures.filter((_, index) => index % 2 === 0);
  const rightColumn = assignatures.filter((_, index) => index % 2 !== 0);

  return (
    <div>
      <Headercap />
      <div className={styles.title}>
        <h1>ELS TEUS CURSOS</h1>
      </div>

      <div className={styles.container}>
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
          {role_User === "professor" && (
            <button onClick={openModal} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}
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

      {modal && <AddAssignaturaModal id_user={id_User} onClose={closeModal} />}
    </div>
  );
}

ProfessorDashboard.propTypes = {
  id_User: PropTypes.number,
  role_User: PropTypes.string,
};

export default ProfessorDashboard;
