import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import AddAssignaturaModal from "./AddAssignaturaModal";
import styles from "./ProfessorDashboard.module.css";
import Headercap from "./Headercap";
import axios from "axios";

function ProfessorDashboard({ professorId }) {
  const [buttonLeft, setButtonLeft] = useState(true);
  const [assignatures, setAssignatures] = useState([]);
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();

  /*COSES A FER:
   1.REPARAR BASE DE DADES. IDs ÚNICS NO INCREMENTALS. 
   2.MOSTRAR LES ASSIGNATURES .
   3.ACCEDIR DINS DE CADA ASSIGNATURA.
  */
  const fetchAssignaturesForProfessor = async (professorId) => {
    try {
      const res = await axios.post("http://localhost:8081/recoverSubjects", {
        professorId: professorId,
      });
      console.log(res.data);
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
  };

  const handleSelectAssignatura = (id) => {
    navigate(`/assignatura/${id}`);
  };

  const leftColumn = assignatures.filter((_, index) => index % 2 === 0);
  const rightColumn = assignatures.filter((_, index) => index % 2 !== 0);

  return (
    <div>
      <Headercap />
      <div className={styles.container}>
        <div className={styles.column}>
          {buttonLeft && (
            <button onClick={openModal} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}
          {leftColumn.map((assignatura) => (
            <div
              key={assignatura.id}
              className={styles.assignaturaCard}
              onClick={() => handleSelectAssignatura(assignatura.id)}
            >
              <h3>{assignatura.nom}</h3>
              <p>ID: {assignatura.id}</p>
            </div>
          ))}
        </div>

        <div className={styles.column}>
          {!buttonLeft && (
            <button onClick={openModal} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}
          {rightColumn.map((assignatura) => (
            <div
              key={assignatura.id}
              className={styles.assignaturaCard}
              onClick={() => handleSelectAssignatura(assignatura.id)}
            >
              <h3>{assignatura.nom}</h3>
              <p>ID: {assignatura.id}</p>
            </div>
          ))}
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
