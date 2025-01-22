import { useState } from "react";
import styles from "./StyleComponents/Headercap.module.css";
import { FaCircleUser } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL2;

function Headercap({}) {
  const [dropdown, setDropdown] = useState(false);
  const location = useLocation(); // Per obtenir la ruta actual
  const navigate = useNavigate();

  // Funció per obrir/tancar el dropdown
  const openCloseDropdown = () => {
    setDropdown(!dropdown);
  };

  // Funció per fer logout
  const handleDelete = () => {
    axios
      .get(`${apiUrl}/logout`)
      .then((res) => {
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };

  // Funció per tornar a la pàgina anterior
  const handleGoBack = () => {
    navigate(-1); // Torna a la pàgina anterior
  };

  return (
    <header className={styles.headercontainer}>
      <div className={styles.leftcontent}>
        <h2>UAB</h2>
      </div>

      <div className={styles.rightcontent}>
        <Dropdown
          show={dropdown}
          onToggle={openCloseDropdown}
          className={styles.dropdownmenu}
        >
          <Dropdown.Toggle
            variant="link"
            style={{
              color: "white",
              backgroundColor: "transparent",
              border: "1px,solid, white",
            }}
          >
            <FaCircleUser />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              as={Link}
              to={{
                pathname: "/profile",
              }}
              onClick={location.pathname === "/profile" ? handleGoBack : null} // Si estem a perfil, tornem a la pàgina anterior
            >
              {location.pathname === "/profile" ? "Tornar" : "Perfil"}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleDelete}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}

export default Headercap;
