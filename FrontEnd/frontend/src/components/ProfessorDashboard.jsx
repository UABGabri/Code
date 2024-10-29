import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import AddAssignaturaModal from "./AddAssignaturaModal";
import styles from "./ProfessorDashboard.module.css";
import Headercap from "./Headercap";
import axios from "axios";

function ProfessorDashboard({ professorId }) {
  const [assignatures, setAssignatures] = useState([]);
  const [modal, setModal] = useState(false);
  const [buttonColumn, setButtonColumn] = useState(false);
  const navigate = useNavigate();

  const fetchAssignaturesForProfessor = async (professorId) => {
    try {
      const res = await axios.post("http://localhost:8081/recoverSubjects", {
        professorId: professorId,
      });
      return res.data;
    } catch (err) {
      console.error("Error a la solicitud:", err);
      return [];
    }
  };

  useEffect(() => {
    if (professorId) {
      fetchAssignaturesForProfessor(professorId).then((data) => {
        setAssignatures(data);
      });
    }
  }, [professorId]);

  const openModal = () => {
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setButtonColumn(!buttonColumn);
  };

  const handleSelectAssignatura = (id, name) => {
    navigate(`/assignatura/${id}`, { state: { name } });
  };

  const leftColumn = assignatures.filter((_, index) => index % 2 === 0);
  const rightColumn = assignatures.filter((_, index) => index % 2 !== 0);

  return (
    <div>
      <Headercap />
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
          {buttonColumn === true && (
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
          {buttonColumn === false && (
            <button onClick={openModal} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}
        </div>
      </div>

      {modal && <AddAssignaturaModal onClose={closeModal} />}
    </div>
  );
}

ProfessorDashboard.propTypes = {
  professorId: PropTypes.number,
};

export default ProfessorDashboard;
