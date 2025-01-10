import { useEffect, useState } from "react";
import axios from "axios";
import Headercap from "./Headercap";
import styles from "./StyleComponents/Profile.module.css";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [values, setValues] = useState({
    niu: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const history = useNavigate();
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8081/user", { withCredentials: true })
      .then((res) => {
        setValues(res.data.user);
      })
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (values.password !== confirmPassword) {
      setError("Si us plau, introdueix contrasenyes coincidents.");
      alert(error);
      return;
    } else {
      axios
        .put("http://localhost:8081/updateUser", values, {
          withCredentials: true,
        })
        .then(() => {})
        .catch((err) => {
          console.error(err);
        });

      history(-1);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDropOut = () => {
    axios
      .delete("http://localhost:8081/deleteUser", {
        params: { values },
        withCredentials: true,
      })
      .then(() => {
        localStorage.clear();
        sessionStorage.clear();

        history("/login");
      })
      .catch((err) => {
        console.error(err);
        alert("S'ha produït un error en intentar donar-se de baixa.");
      });
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
            <label>Nom d'usuari:</label>
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleInputChange}
              required
              pattern="^[A-Za-zÀ-ÿ\s]+$"
              title="Nom amb lletres de l'alfabet"
              className={styles.inputProfile}
              placeholder="Nom d'usuari"
            />
          </div>

          <div>
            <label>Correu electrònic:</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleInputChange}
              required
              title="Introdueix un correu electrònic vàlid"
              className={styles.inputProfile}
              placeholder="Correu electrònic"
            />
          </div>

          <div>
            <label>Contrasenya:</label>
            <input
              type="password"
              name="password"
              onChange={handleInputChange}
              required
              id="password"
              minLength={8}
              title="Es necessiten almenys 8 caràcters"
              className={styles.inputProfile}
              placeholder="Nova Contrasenya"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contrasenya:
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
            <label>Rol (No editable):</label>
            <input
              type="text"
              name="role"
              value={values.role}
              readOnly
              className={styles.inputProfile}
            />
          </div>

          <button type="submit" className={styles.saveButton}>
            Desar Canvis
          </button>

          <button
            type="button"
            onClick={openModal}
            className={styles.dropButton}
          >
            Eliminar Compte
          </button>
        </form>

        {isModalOpen && (
          <div className={styles.modalOver}>
            <div className={styles.modalContent}>
              <p>Estàs segur? El teu compte serà eliminat.</p>
              <div className={styles.modalButtons}>
                <button
                  onClick={handleConfirmDropOut}
                  className={styles.acceptButton}
                >
                  Acceptar
                </button>
                <button onClick={closeModal} className={styles.cancelButton}>
                  Cancel·lar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
