import { useState } from "react";
import styles from "./StyleComponents/Headercap.module.css";
import { FaCircleUser } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";

import axios from "axios";

function Headercap() {
  const [dropdown, setDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  //Funció per definir la visualització del dropdown
  const openCloseDropdown = () => {
    setDropdown(!dropdown);
  };

  //Funció que serveix per fer un logout
  const handleDelete = () => {
    axios
      .get("http://localhost:8081/logout")
      .then((res) => {
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };

  //Funció per tornar a la pestanya anterior
  const handleGoBack = () => {
    if (location.pathname === "/profile") {
      return "/modules";
    }
    return "/profile";
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
            <Dropdown.Item as={Link} to={handleGoBack()}>
              {location.pathname === "/profile" ? "Go back" : "Profile"}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleDelete}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}

export default Headercap;
