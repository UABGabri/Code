import Headercap from "./Headercap";
import styles from "./ProfessorDashboard.module.css";
import { useState } from "react";
import AddAssignaturaModal from "./AddAssignaturaModal";

function ProfessorDashboard() {
  const [buttonLeft, setButtonLeft] = useState(true); //control posició botó.
  const [assignatures, setAssignatures] = useState([]); //array de assignatures.
  const [modal, setModal] = useState(false); //control de finestra emergent Modal.

  const addSubject = () => {
    setModal(!modal);
    setButtonLeft(!buttonLeft);
    //console.log(buttonLeft);
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
      {modal && <AddAssignaturaModal onClose={addSubject} />}{" "}
      {/* Manera d'afegir un comentari i obtenir modal*/}
    </div>
  );
}

export default ProfessorDashboard;
