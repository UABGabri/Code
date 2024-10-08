import { useNavigate } from 'react-router-dom';
import styles from './Homepage.module.css'
import logo from './assets/uab.png'

function Homepage() {
  
    const navigate = useNavigate(); // navegación

    const handleLogin = () => {
    navigate('login'); 
    };

    const handleRegister = () => {
    navigate('register'); 
    };

  return (
    <div className= {styles.homecontainer}>
      <div className={styles.green}>
        <h1 className={styles.logos}>UAB</h1>
      </div>
      <div className={styles.white}>
        <h1 className={styles.welcome}>BENVINGUT</h1>
        <div className={styles.buttcontainer}>
          <button className={styles.homebtn} onClick={handleLogin}>Crea el teu compte</button>
          <button className={styles.homebtn} onClick={handleRegister}>Ja tens compte?</button>
        </div>
      </div>
    </div>
  );

}

export default Homepage
