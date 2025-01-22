import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./StyleComponents/Homepage.module.css";

const apiUrl = import.meta.env.VITE_API_URL;

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

  // Funció per validar el correu electrònic.
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  // Canviar el rol segons el domini del correu per facilitar assignació de rol.
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
      .post(`${apiUrl}/register`, values, {
        withCredentials: true,
      })
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
          {error && <div>{error}</div>}

          <form onSubmit={handleConfirmPassword}>
            <div>
              <label htmlFor="username">Nom de usuari</label>
              <input
                type="text"
                name="username"
                onChange={(e) =>
                  setValues({ ...values, username: e.target.value })
                }
                id="username"
                placeholder="Introdueix el teu nom de usuari"
                required
                maxLength={15}
                pattern="^[A-Za-zÀ-ÿ\s]+$"
                title="El nom només ha de tenir lletres"
              />
            </div>

            <div>
              <label htmlFor="niu">NIU</label>
              <input
                type="text"
                name="niu"
                onChange={(e) => setValues({ ...values, niu: e.target.value })}
                id="niu"
                placeholder="Introdueix el teu NIU"
                required
                maxLength={7}
                pattern="^\d{7}$"
                title="El NIU ha de ser un número de 7 dígits"
              />
            </div>

            <div>
              <label htmlFor="gmail">Correu electrònic</label>
              <input
                type="email"
                name="gmail"
                onChange={(e) =>
                  setValues({ ...values, gmail: e.target.value })
                }
                id="gmail"
                placeholder="Introdueix el teu correu"
                required
                maxLength={30}
                title="Introdueix un correu vàlid"
              />
            </div>

            <div>
              <label htmlFor="password">Contrasenya</label>
              <input
                type="password"
                name="password"
                onChange={(e) => {
                  setValues({ ...values, password: e.target.value });
                  setIsPasswordValid(validatePassword(e.target.value));
                }}
                id="password"
                placeholder="Introdueix la teva contrasenya"
                required
                minLength={8}
                maxLength={10}
                title="La contrasenya ha de tenir entre 8 i 10 caràcters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirmar contrasenya</label>
              <input
                type="password"
                name="confirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
                id="confirmPassword"
                minLength={8}
                maxLength={10}
                required
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
