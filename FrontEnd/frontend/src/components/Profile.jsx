import { useEffect, useState } from "react";
import axios from "axios";
import Headercap from "./Headercap";
import styles from "./StyleComponents/Profile.module.css";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

function Profile() {
  const [values, setValues] = useState({
    niu: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const history = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${apiUrl}/user`, { withCredentials: true })
      .then((res) => {
        if (res.data.Status === "Success") setValues(res.data.user);
      })
      .catch((err) => {
        alert(err);
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
      alert("Si us plau, introdueix contrasenyes coincidents.");
      return;
    } else {
      axios
        .put(`${apiUrl}/updateUser`, values, {
          withCredentials: true,
        })
        .then((res) => {
          console.log(res);
          if (res.data.Status === "Failed") alert("Aquest email ja existeix");
          if (res.data.Status === "Success") alert("Canvis efectuats");
        })
        .catch((err) => {
          console.error(err);
        });
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
      .delete(`${apiUrl}/deleteUser`, {
        params: { values },
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status === "Success") {
          localStorage.clear();
          sessionStorage.clear();
          history("/login");
        }
      })
      .catch((err) => {
        alert(err);
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
              maxLength={15}
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
              maxLength={30}
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
              maxLength={10}
              title="Es necessiten almenys entre 8 i 10 caràcters"
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
              required
              minLength={8}
              maxLength={10}
              placeholder="Confirma la contrasenya"
              title="Es necessiten almenys entre 8 i 10 caràcters"
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
