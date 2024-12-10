import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./StyleComponents/Homepage.module.css";

function Register() {
  const [values, setValues] = useState({
    //Emmagatzema tots els components necessaris per crear un usuari.
    niu: "",
    username: "",
    gmail: "",
    password: "",
    role: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); //Errors utilitzats per la verificació de les passwords.

  //Defineix el rol de l'usuari a la base de dades segons l'extensió del gmail introduit.
  useEffect(() => {
    const gmailDomain = values.gmail.split("@")[1];
    if (gmailDomain === "teacher.cat") {
      setValues((prevValues) => ({ ...prevValues, role: "Professor" }));
    } else {
      setValues((prevValues) => ({ ...prevValues, role: "Alumne" }));
    }
  }, [values.gmail]);

  //Registra l'usuari a la base de dades. Realitza una verificació doble de les passwords.
  const handleConfirmPassword = (event) => {
    console.log(values);
    event.preventDefault();

    if (values.password !== confirmPassword) {
      setError("Sisplau, introdueix contrasenyes iguals");
      return;
    } else {
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
          console.error("Error a la solicitud:", err);
        });
    }
  };

  const navigate = useNavigate();
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
                title="El nom només ha de tenir lletres de l'abecedari"
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
                type="gmail"
                name="gmail"
                onChange={(e) =>
                  setValues({ ...values, gmail: e.target.value })
                }
                className="form-control"
                id="gmail"
                placeholder="Introdueix el teu correu"
                required
                title="Introdueix un email vàlid"
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Contrasenya
              </label>
              <input
                type="password"
                name="password"
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                className="form-control"
                id="password"
                placeholder="Introdueix la teva contrasenya"
                required
                minLength={8}
                title="La contrasenya ha de tenir 8 carácters min"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar contraseña
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
