import { useState } from "react";
import styles from "./Headercap.module.css";
import { FaCircleUser } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
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

  const openCloseDropdown = () => {
    setDropdown(!dropdown);
  };

  const handleDelete = () => {
    axios
      .get("http://localhost:8081/logout")
      .then((res) => {
        location.reload(true);
      })
      .catch((err) => console.log(err));
  };

  const handleGoBack = () => {
    //Per veure quan estem dins la pantalla perfil o altres.

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
