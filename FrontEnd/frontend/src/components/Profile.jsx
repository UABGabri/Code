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
        //console.log("Resposta del servidor:", res.data);
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

    if (values.password !== confirmPassword) {
      setError("Please enter matching passwords.");
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
        alert("An error occurred while trying to drop out.");
      });
  };

  return (
    <div>
      <Headercap />
      <div className={styles.maindisplay}>
        <h1>Edit Profile</h1>

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
              title="Name with letters from the alphabet"
              className={styles.inputProfile}
              placeholder="Username"
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
              title="Input a valid email"
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
              title="Needs 8 characters min"
              className={styles.inputProfile}
              placeholder="New Password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm password
            </label>
            <input
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.inputProfile}
              id="confirmPassword"
              placeholder="Confirm password"
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
            Save Changes
          </button>

          <button
            type="button"
            onClick={openModal}
            className={styles.dropButton}
          >
            Drop out
          </button>
        </form>

        {isModalOpen && (
          <div className={styles.modalOver}>
            <div className={styles.modalContent}>
              <p>Are you sure? Your account will be eliminated.</p>
              <div className={styles.modalButtons}>
                <button
                  onClick={handleConfirmDropOut}
                  className={styles.acceptButton}
                >
                  Accept
                </button>
                <button onClick={closeModal} className={styles.cancelButton}>
                  Cancel
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
