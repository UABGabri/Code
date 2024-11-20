import { useParams, useLocation, useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import styles from "./StyleComponents/AssignaturaLayout.module.css";
import { BiArrowBack } from "react-icons/bi";
import { useState } from "react";
import ElementsCurs from "./ElementsCurs";
import ElementsPreguntes from "./ElementsPreguntes";
import ElementsParticipants from "./ElementsParticipants";
import ElementsTests from "./ElementsTests";

function AssignaturaLayout() {
  const { id } = useParams(); //id de la ASSIGNATURA
  const location = useLocation();
  const { name, professorId } = location.state;
  const history = useNavigate();
  const [menuOption, setMenuOption] = useState("CURS");

  //Estructura per modificar contingut visualitzat sota la capçalera segons la selecció del menu
  const render = () => {
    switch (menuOption) {
      case "CURS":
        return <ElementsCurs idAssignatura={id} />;
      case "PARTICIPANTS":
        return <ElementsParticipants idAssignatura={id} />;
      case "PREGUNTES":
        return (
          <ElementsPreguntes professorId={professorId} idAssignatura={id} />
        );
      case "TESTS":
        return <ElementsTests idAssignatura={id} />;
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
    </div>
  );
}

export default AssignaturaLayout;
