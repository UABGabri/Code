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
  const { id } = useParams();
  const location = useLocation();
  const { name, id_User, role_User, previousMenuOption } = location.state || {};
  const navigate = useNavigate();
  const [menuOption, setMenuOption] = useState(previousMenuOption || "COURSE");

  const handleMenuChange = (option) => {
    setMenuOption(option);
    navigate(".", { state: { ...location.state, previousMenuOption: option } });
  };

  const render = () => {
    switch (menuOption) {
      case "COURSE":
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
      case "QUESTIONS":
        return (
          <ElementsPreguntes
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
      default:
        return null;
    }
  };

  const handleBackClick = () => {
    navigate(-1, { state: { previousMenuOption: menuOption } });
  };

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack onClick={handleBackClick} className={styles.backArrow} />
        <span>{name}</span>
        <span>{id}</span>
      </header>

      <div className={styles.mainMenu}>
        <span
          className={menuOption === "COURSE" ? styles.activeTab : ""}
          onClick={() => handleMenuChange("COURSE")}
        >
          Course
        </span>
        <span
          className={menuOption === "PARTICIPANTS" ? styles.activeTab : ""}
          onClick={() => handleMenuChange("PARTICIPANTS")}
        >
          Participants
        </span>
        <span
          className={menuOption === "QUESTIONS" ? styles.activeTab : ""}
          onClick={() => handleMenuChange("QUESTIONS")}
        >
          Questions
        </span>
        <span
          className={menuOption === "TESTS" ? styles.activeTab : ""}
          onClick={() => handleMenuChange("TESTS")}
        >
          Tests
        </span>
      </div>

      <div className={styles.contentElements}>{render()}</div>
    </div>
  );
}

export default AssignaturaLayout;
