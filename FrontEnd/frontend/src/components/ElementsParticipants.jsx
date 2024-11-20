import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css";
function ElementsParticipants({ idAssignatura }) {
  const [users, setUsers] = useState([]);

  //Funció per recuperar els participants d'una assignatura
  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverAtendees", {
        params: { idAssignatura },
      })
      .then((res) => {
        console.log(res);
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  }, [idAssignatura]);

  return (
    <div>
      <div className={styles.participantContainer}>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ElementsParticipants.propTypes = {
  idAssignatura: PropTypes.string.isRequired,
};

export default ElementsParticipants;
