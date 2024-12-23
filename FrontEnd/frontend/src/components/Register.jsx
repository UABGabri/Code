import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./StyleComponents/Homepage.module.css";

function Register() {
  // Emmagatzemem les dades del formulari
  const [values, setValues] = useState({
    niu: "",
    username: "",
    gmail: "",
    password: "",
    role: "",
  });

  const [confirmPassword, setConfirmPassword] = useState(""); // Contrasenya de confirmació
  const [error, setError] = useState(""); // Missatges d'error
  const [isValidEmail, setIsValidEmail] = useState(true); // Validar el correu
  const [isPasswordValid, setIsPasswordValid] = useState(true); // Validar la contrasenya

  const navigate = useNavigate();

  // Funció per validar el correu electrònic
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  // Canviar el rol segons el domini del correu
  useEffect(() => {
    if (values.gmail) {
      const gmailDomain = values.gmail.split("@")[1];
      if (gmailDomain === "teacher.cat") {
        setValues((prevValues) => ({ ...prevValues, role: "Professor" }));
      } else {
        setValues((prevValues) => ({ ...prevValues, role: "Alumne" }));
      }
      setIsValidEmail(validateEmail(values.gmail)); // Verificar el correu
    }
  }, [values.gmail]);

  // Verificar la contrasenya
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Enviar dades de registre al servidor
  const handleConfirmPassword = (event) => {
    event.preventDefault();

    if (!isValidEmail) {
      setError("Correu electrònic no vàlid");
      return;
    }

    if (!isPasswordValid) {
      setError("La contrasenya ha de tenir almenys 8 caràcters");
      return;
    }

    if (values.password !== confirmPassword) {
      setError("Sisplau, introdueix contrasenyes iguals");
      return;
    }

    // Registrar l'usuari al servidor
    axios
      .post("http://localhost:8081/register", values)
      .then((res) => {
        if (res.data.error) {
          setError(res.data.error);
        } else {
          handleLogin();
        }
      })
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  };

  // Redirigir a la pàgina de login
  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className={styles.homecontainer}>
      <div className={styles.green}>
        <h1 className={styles.logos}>UAB</h1>
      </div>
      <div className={styles.white}>
        <div>
          <h2>Registre</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <form className="form-label-1" onSubmit={handleConfirmPassword}>
            <div>
              <label htmlFor="username" className="form-label">
                Nom de usuari
              </label>
              <input
                type="text"
                name="username"
                onChange={(e) =>
                  setValues({ ...values, username: e.target.value })
                }
                className="form-control"
                id="username"
                placeholder="Introdueix el teu nom de usuari"
                required
                pattern="^[A-Za-zÀ-ÿ\s]+$"
                title="El nom només ha de tenir lletres"
              />
            </div>

            <div>
              <label htmlFor="niu" className="form-label-2">
                NIU
              </label>
              <input
                type="text"
                name="niu"
                onChange={(e) => setValues({ ...values, niu: e.target.value })}
                className="form-control"
                id="niu"
                placeholder="Introdueix el teu NIU"
                required
                pattern="^\d{7}$"
                title="El NIU ha de ser un número de 7 dígits"
              />
            </div>

            <div>
              <label htmlFor="gmail" className="form-label">
                Correu electrònic
              </label>
              <input
                type="email"
                name="gmail"
                onChange={(e) =>
                  setValues({ ...values, gmail: e.target.value })
                }
                className="form-control"
                id="gmail"
                placeholder="Introdueix el teu correu"
                required
                title="Introdueix un correu vàlid"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Contrasenya
              </label>
              <input
                type="password"
                name="password"
                onChange={(e) => {
                  setValues({ ...values, password: e.target.value });
                  setIsPasswordValid(validatePassword(e.target.value));
                }}
                className="form-control"
                id="password"
                placeholder="Introdueix la teva contrasenya"
                required
                minLength={8}
                title="La contrasenya ha de tenir 8 caràcters mínims"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar contrasenya
              </label>
              <input
                type="password"
                name="confirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                id="confirmPassword"
                placeholder="Confirma la contrasenya"
              />
            </div>

            <div className={styles.registerbtncontainer}>
              <button type="submit" className={styles.registerbtn}>
                Registrar-se
              </button>
              <button className={styles.registerbtn} onClick={handleLogin}>
                Ja tens un compte?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
