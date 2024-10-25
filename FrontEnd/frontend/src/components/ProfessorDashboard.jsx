import Headercap from "./Headercap";
import styles from "./ProfessorDashboard.module.css";
import { useState } from "react";

function ProfessorDashboard() {
  const [buttonLeft, setButtonLeft] = useState(true);

  const addSubject = () => {
    setButtonLeft(!buttonLeft);
    console.log(buttonLeft);
  };

  return (
    <div>
      <Headercap></Headercap>
      <div className={styles.container}>
        <div className={styles.left}>
          {buttonLeft && (
            <button onClick={addSubject} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}
        </div>
        <div className={styles.right}>
          {!buttonLeft && (
            <button onClick={addSubject} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfessorDashboard;
