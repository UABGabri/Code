import Headercap from "./Headercap";
import styles from "./ProfessorDashboard.module.css";
import { useState } from "react";
import AddAssignaturaModal from "./AddAssignaturaModal";

function ProfessorDashboard() {
  const [buttonLeft, setButtonLeft] = useState(true); //control posició botó.
  const [assignatures, setAssignatures] = useState([]); //array de assignatures.
  const [modal, setModal] = useState(false); //control de finestra emergent Modal.

  const addSubject = () => {
    setButtonLeft(!buttonLeft);
    //console.log(buttonLeft);
  };

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

  return (
    <div>
      <Headercap></Headercap>
      <div className={styles.container}>
        <div className={styles.left}>
          {buttonLeft && (
            <button onClick={openModal} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}
        </div>
        <div className={styles.right}>
          {!buttonLeft && (
            <button onClick={openModal} className={styles.addButton}>
              Afegir Assignatura
            </button>
          )}
        </div>
      </div>
      {modal && <AddAssignaturaModal onClose={closeModal} onAdd={addSubject} />}{" "}
      {/* Manera d'afegir un comentari i obtenir modal*/}
    </div>
  );
}

export default ProfessorDashboard;
