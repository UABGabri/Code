import { useEffect, useState } from "react";
import axios from "axios";
import Headercap from "./Headercap";
import styles from "./StyleComponents/Profile.module.css";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [values, setValues] = useState({
    niu: "", //valor no intercanviable
    username: "",
    email: "",
    password: "",
    role: "", //valor no intercanviable
  });

  const history = useNavigate();
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  useEffect(() => {
    // Recupera les dades de l'usuari en carregar el component
    axios
      .get("http://localhost:8081/user", { withCredentials: true })
      .then((res) => {
        console.log("Resposta del servidor:", res.data);

        setValues(res.data.user);
      })
      .catch((err) => {
        console.error("Error a la solicitud:", err);
      });
  }, []);

  // Actualitza l'estat amb els canvis introduïts a cada camp
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Envia les dades actualitzades al servidor.
  const handleSubmit = (e) => {
    e.preventDefault();

    if (values.password !== confirmPassword) {
      setError("Sisplau, introdueix contrasenyes iguals");
      alert(error);
      return;
    } else {
      axios
        .put("http://localhost:8081/updateUser", values, {
          withCredentials: true,
        })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.error(err);
        });

      history(-1);
    }
  };

  return (
    <div>
      <Headercap />
      <div className={styles.maindisplay}>
        <h1>Editar Perfil</h1>

        <form onSubmit={handleSubmit} className={styles.formProfile}>
          <div>
            <label>NIU (No editable):</label>
            <input
              type="text"
              name="niu"
              value={values.niu}
              readOnly
              className={styles.inputProfile}
            />
          </div>

          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleInputChange}
              required
              pattern="^[A-Za-zÀ-ÿ\s]+$"
              title="El nom només ha de tenir lletres de l'abecedari"
              className={styles.inputProfile}
              placeholder="Nom del usuari"
            />
          </div>

          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleInputChange}
              required
              title="Introdueix un email vàlid"
              className={styles.inputProfile}
              placeholder="Email"
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              onChange={handleInputChange}
              required
              id="password"
              minLength={8}
              title="La contrasenya ha de tenir 8 carácters min"
              className={styles.inputProfile}
              placeholder="Nova contrasenya"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseña
            </label>
            <input
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.inputProfile}
              id="confirmPassword"
              placeholder="Confirma la contrasenya"
            />
          </div>

          <div>
            <label>Role (No editable):</label>
            <input
              type="text"
              name="role"
              value={values.role}
              readOnly
              className={styles.inputProfile}
            />
          </div>

          <button type="submit" className={styles.saveButton}>
            Guardar Cambis
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
