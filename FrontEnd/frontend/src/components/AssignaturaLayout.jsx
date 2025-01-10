import { useParams, useLocation, useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import styles from "./StyleComponents/AssignaturaLayout.module.css";
import { BiArrowBack } from "react-icons/bi";
import { useState } from "react";
import ElementsCurs from "./ElementsCurs";
import ElementsQuestions from "./ElementsQuestions";
import ElementsParticipants from "./ElementsParticipants";
import ElementsTests from "./ElementsTests";
import { FaSignOutAlt } from "react-icons/fa";
import axios from "axios";

function AssignaturaLayout() {
  const { id } = useParams(); //id de la ASSIGNATURA
  const location = useLocation();
  const { name, id_User, role_User } = location.state;
  const history = useNavigate();
  const [menuOption, setMenuOption] = useState("CURS");
  const [leaveSubject, setLeaveSubject] = useState(false);

  //Funció per abandonar una assignatura
  const handleConfirmDropOut = () => {
    console.log(id);

    axios
      .delete("http://localhost:8081/leaveSubject", {
        params: { Id_Assignatura: id, id: id_User, role_User },
      })
      .then(() => {
        alert("Has abandonat l'assignatura");
        history("/modules");
      })
      .catch((error) => console.error("Error al recuperar temes:", error));
  };

  //Estructura per modificar contingut visualitzat sota la capçalera segons la selecció del menu.
  const render = () => {
    switch (menuOption) {
      case "CURS":
        return (
          <ElementsCurs
            Id_User={id_User}
            Id_Assignatura={id}
            Role_User={role_User}
          />
        );
      case "PARTICIPANTS":
        return (
          <ElementsParticipants Id_Assignatura={id} Role_User={role_User} />
        );
      case "PREGUNTES":
        return (
          <ElementsQuestions
            Id_User={id_User}
            Id_Assignatura={id}
            Role_User={role_User}
          />
        );
      case "TESTS":
        return (
          <ElementsTests
            professorId={id_User}
            idAssignatura={id}
            Role_User={role_User}
          />
        );
    }
  };

  const handleOpenModal = () => {
    setLeaveSubject(true);
  };

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <div className={styles.elementHeader}>
          <BiArrowBack
            onClick={() => history(-1)}
            className={styles.backArrow}
          />
          <div className={styles.informationHeader}>
            <span>{name}</span>
            <span>{id}</span>
          </div>
        </div>

        <button className={styles.buttonSecondHeader} onClick={handleOpenModal}>
          <FaSignOutAlt />
        </button>
      </header>

      <div className={styles.mainMenu}>
        <span
          className={menuOption === "CURS" ? styles.activeTab : ""}
          key="CURS"
          onClick={() => setMenuOption("CURS")}
        >
          CURS
        </span>
        <span
          className={menuOption === "PARTICIPANTS" ? styles.activeTab : ""}
          key="PARTICIPANTS"
          onClick={() => setMenuOption("PARTICIPANTS")}
        >
          PARTICIPANTS
        </span>
        <span
          className={menuOption === "PREGUNTES" ? styles.activeTab : ""}
          key="PREGUNTES"
          onClick={() => setMenuOption("PREGUNTES")}
        >
          PREGUNTES
        </span>
        <span
          className={menuOption === "TESTS" ? styles.activeTab : ""}
          key="TESTS"
          onClick={() => setMenuOption("TESTS")}
        >
          TESTS
        </span>
      </div>

      <div className={styles.contentElements}>{render()}</div>

      {leaveSubject && (
        <div className={styles.modalOver}>
          <div className={styles.modalContent}>
            <p>Estàs segur de deixar aquesta assignatura?</p>
            <div className={styles.modalButtons}>
              <button onClick={handleConfirmDropOut}>Acceptar</button>
              <button onClick={() => setLeaveSubject(false)}>Cancel·lar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignaturaLayout;
