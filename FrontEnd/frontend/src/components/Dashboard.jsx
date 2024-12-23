import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import AddSubjectModal from "./AddSubjectModal";
import styles from "./StyleComponents/ProfessorDashboard.module.css";
import Headercap from "./Headercap";
import axios from "axios";

function Dashboard({ id_User, role_User }) {
  const [assignatures, setAssignatures] = useState([]);
  const [modal, setModal] = useState(false);
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
      console.error("id_User o role_User no està definit");
    }
  }, [id_User, role_User]);

  const openModal = () => {
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
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
        <h1>YOUR COURSES</h1>
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
              Add Subject
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

      {modal && <AddSubjectModal id_User={id_User} onClose={closeModal} />}
    </div>
  );
}

Dashboard.propTypes = {
  id_User: PropTypes.number.isRequired,
  role_User: PropTypes.string.isRequired,
};

export default Dashboard;
