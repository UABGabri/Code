import { useParams, useLocation, useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import styles from "./StyleComponents/AssignaturaLayout.module.css";
import { BiArrowBack } from "react-icons/bi";
import { useState } from "react";
import ElementsCurs from "./ElementsCurs";
import ElementsQuestions from "./ElementsQuestions";
import ElementsParticipants from "./ElementsParticipants";
//import ElementsTestsProfessor from "./ElementsTestsProfessor";
import ElementsTests from "./ElementsTests";

function AssignaturaLayout() {
  const { id } = useParams(); //id de la ASSIGNATURA
  const location = useLocation();
  const { name, id_User, role_User } = location.state;
  const history = useNavigate();
  const [menuOption, setMenuOption] = useState("CURS");

  //Estructura per modificar contingut visualitzat sota la capçalera segons la selecció del menu
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

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack onClick={() => history(-1)} className={styles.backArrow} />
        <span>{name}</span>
        <span>{id}</span>
      </header>

      <div className={styles.mainMenu}>
        <span
          className={menuOption === "CURS" ? styles.activeTab : ""}
          key="CURS"
          onClick={() => setMenuOption("CURS")}
        >
          Course
        </span>
        <span
          className={menuOption === "PARTICIPANTS" ? styles.activeTab : ""}
          key="PARTICIPANTS"
          onClick={() => setMenuOption("PARTICIPANTS")}
        >
          Participants
        </span>
        <span
          className={menuOption === "PREGUNTES" ? styles.activeTab : ""}
          key="PREGUNTES"
          onClick={() => setMenuOption("PREGUNTES")}
        >
          Questions
        </span>
        <span
          className={menuOption === "TESTS" ? styles.activeTab : ""}
          key="TESTS"
          onClick={() => setMenuOption("TESTS")}
        >
          Tests
        </span>
      </div>

      <div className={styles.contentElements}>{render()}</div>
    </div>
  );
}

export default AssignaturaLayout;
