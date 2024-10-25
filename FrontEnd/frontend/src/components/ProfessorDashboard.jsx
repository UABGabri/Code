import { Link } from "react-router-dom";
import Headercap from "./Headercap";
import styles from "./ProfessorDashboard.module.css";
import { useState } from "react";

function ProfessorDashboard() {
  const [buttonLeft, setButtonLeft] = useState(true);

  return (
    <div>
      <Headercap></Headercap>
      <div className={styles.container}>
        <div className={styles.left}>
          {buttonLeft && <button>Afegir Assignatura</button>}
        </div>
        <div className={styles.right}>
          {!buttonLeft && <button>Afegir Assignatura</button>}
        </div>
      </div>
    </div>
  );
}

export default ProfessorDashboard;
