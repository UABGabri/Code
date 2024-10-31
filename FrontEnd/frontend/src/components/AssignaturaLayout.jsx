import { useParams, useLocation, useNavigate } from "react-router-dom";
import Headercap from "./Headercap";
import styles from "./AssignaturaLayout.module.css";
import { BiArrowBack } from "react-icons/bi";

function AssignaturaLayout() {
  const { id } = useParams();
  const location = useLocation();
  const { name } = location.state;
  const history = useNavigate();

  return (
    <div>
      <Headercap />
      <header className={styles.headerSubject}>
        <BiArrowBack onClick={() => history(-1)} className={styles.backArrow} />
        <span>{name}</span>
        <span>{id}</span>
      </header>

      <div className={styles.mainMenu}>
        <span>CURS</span>
        <span>PARTICIPANTS</span>
        <span>PREGUNTES</span>
        <span>TESTS</span>
      </div>
    </div>
  );
}

export default AssignaturaLayout;
