import { useState } from "react";
import styles from "./Headercap.module.css";
import { FaCircleUser } from "react-icons/fa6";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";

import axios from "axios";

function Headercap() {
  const [dropdown, setDropdown] = useState(false);

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
          <Dropdown.Toggle>
            <FaCircleUser />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>
              {" "}
              <Link
                to="/profile"
                style={{ textDecoration: "none", color: "black" }}
              >
                {" "}
                Perfil{" "}
              </Link>
            </Dropdown.Item>
            <Dropdown.Item onClick={handleDelete}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}

export default Headercap;
