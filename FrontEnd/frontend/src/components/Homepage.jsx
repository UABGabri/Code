import { useNavigate } from "react-router-dom";
import styles from "./StyleComponents/Homepage.module.css";

function Homepage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("login");
  };

  const handleRegister = () => {
    navigate("register");
  };

  return (
    <div className={styles.homecontainer}>
      <div className={styles.green}>
        <h1 className={styles.logos}>UAB</h1>
      </div>
      <div className={styles.white}>
        <h1 className={styles.welcome}>BENVINGUT</h1>
        <div className={styles.buttcontainer}>
          <button className={styles.homebtn} onClick={handleRegister}>
            Crea el teu compte
          </button>
          <button className={styles.homebtn} onClick={handleLogin}>
            Ja tens compte?
          </button>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
