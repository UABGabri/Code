import { Link } from "react-router-dom";
import Headercap from "./Headercap";
import styles from "./ProfessorDashboard.module.css";

function ProfessorDashboard() {
  return (
    <div>
      <Headercap></Headercap>
      <div className={styles.container}>
        <div>
          <Link to={"/AfegirAssignatura"}>
            <button>Afegir Assignatura</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfessorDashboard;
