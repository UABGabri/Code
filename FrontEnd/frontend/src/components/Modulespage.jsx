import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProfessorDashboard from "./ProfessorDashboard";

function Modulespage() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState(false);
  const [niu, setNiu] = useState("");

  // Configura axios perquè inclogui les cookies en totes les sol·licituds
  axios.defaults.withCredentials = true;

  // Recupera informació de l'usuari quan es carrega el component
  useEffect(() => {
    axios
      .get("http://localhost:8081/")
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setName(res.data.name);
          setRole(res.data.role);
          setNiu(res.data.niu);
          //console.log(typeof res.data.niu);
        } else {
          setAuth(false);
          setMessage(res.data.Error);
        }
      })
      .catch((err) => {
        console.error("Error a la solicitud:", err);
      });
  }, []);

  // Aquest mòdul gestiona la bifurcació segura de la visualització de continguts.
  // Utilitza el token d'autenticació per decidir les accions disponibles.
  return (
    <div>
      {auth ? (
        <ProfessorDashboard id_User={niu} role_User={role} />
      ) : (
        <div>
          <h3>{message}</h3>
          <Link to="/login">Login</Link>
        </div>
      )}
    </div>
  );
}

export default Modulespage;
