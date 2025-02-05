import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./StyleComponents/Homepage.module.css";

const apiUrl = import.meta.env.VITE_API_URL;

function Login() {
  const [values, setValues] = useState({
    niu: "",
    password: "",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/register");
  };

  axios.defaults.withCredentials = true; // Configura axios per incloure credencials (cookies) en totes les sol·licituds

  // Gestiona l'enviament del formulari mitjançant una sol·licitud POST.
  const handleSubmit = (e) => {
    e.preventDefault();

    if (values.niu === "" || values.password === "") {
      setError("Sisplau, emplena tots els camps.");
      return;
    } else {
      axios
        .post(`${apiUrl}/login`, values) //Sol·licitud POST al servidor amb els valors de l'usuari.
        .then((res) => {
          if (res.data.Status === "Success") {
            navigate("/modules");
          } else if (res.data.Error === "Contrasenya incorrecta") {
            setError("Error. Contrasenya Incorrecta.");
          }
        })
        .catch((err) => {
          console.error("Error a la sol·licitud:", err);
        });
    }
  };

  return (
    <div className={styles.homecontainer}>
      <div className={styles.green}>
        <h1 className={styles.logos}>UAB</h1>
      </div>
      <div className={styles.white}>
        <div>
          <div className={styles.logincontainer}>
            <h2>Iniciar sessió</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username">NIU de usuari</label>
                <input
                  type="text"
                  id="username"
                  onChange={(e) => {
                    setValues({ ...values, niu: e.target.value });
                  }}
                  maxLength={7}
                  required
                  className={styles.inputField}
                  pattern="^\d{7}$"
                  title="El NIU ha de ser un número de 7 dígits"
                />
              </div>
              <div>
                <label htmlFor="password">Contrasenya</label>
                <input
                  type="password"
                  id="password"
                  className={styles.inputField}
                  onChange={(e) => {
                    setValues({ ...values, password: e.target.value });
                  }}
                  maxLength={10}
                  minLength={8}
                  title="La contrasenya ha de tenir entre 8 i 10 caràcters. Només números i lletres."
                />
              </div>

              <div className={styles.registerbtncontainer}>
                <button type="submit" className={styles.loginbtn}>
                  Iniciar sessió
                </button>

                <button className={styles.loginbtn} onClick={handleRegister}>
                  No tens compte?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
