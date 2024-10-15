import { useState } from "react";
import styles from "./Headercap.module.css";
import { FaCircleUser } from "react-icons/fa6";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap"; // Cambia esto a react-bootstrap

function Headercap() {
  const [dropdown, setDropdown] = useState(false);

  const openCloseDropdown = () => {
    setDropdown(!dropdown);
  };

  return (
    <header className={styles.headercontainer}>
      <div className="content">
        <Dropdown
          show={dropdown}
          onToggle={openCloseDropdown}
          className={styles.dropdownmenu}
        >
          <Dropdown.Toggle>
            <FaCircleUser />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#">Perfil</Dropdown.Item>

            <Dropdown.Item href="#">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}

export default Headercap;
