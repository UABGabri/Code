import { useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import styles from "./StyleComponents/AssignaturaLayout.module.css";
import { BiArrowBack } from "react-icons/bi";

function PersonalitzarTest() {
  const history = useNavigate();

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack onClick={() => history(-1)} className={styles.backArrow} />
      </header>
    </div>
  );
}

export default PersonalitzarTest;
