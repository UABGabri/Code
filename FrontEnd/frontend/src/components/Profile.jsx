import { useEffect, useState } from "react";
import axios from "axios";
import Headercap from "./Headercap";
import styles from "./Profile.module.css";

function Profile() {
  const [values, setValues] = useState({
    niu: "", //valor no intercanviable
    username: "",
    email: "",
    password: "",
    role: "", //valor no intercanviable
  });

  /*
  const [isEditing, setIsEditing] = useState({
    username: false,
    password: false,
    email: false,
  });*/

  useEffect(() => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
  };

  return (
    <div>
      <Headercap />
      <div className={styles.maindisplay}>
        <h1>Editar Perfil</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label>NIU (No editable):</label>
            <input type="text" name="niu" value={values.niu} readOnly />
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
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              name="password"
              onChange={handleInputChange}
              required
              minLength={8}
              title="La contrasenya ha de tenir 8 carácters min"
            />
          </div>

          <div>
            <label>Role (No editable):</label>
            <input type="text" name="role" value={values.role} readOnly />
          </div>

          <button type="submit">Guardar Cambios</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
