import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProfessorDashboard from "./ProfessorDashboard";
import StudentDashboard from "./StudentDashboard";

function Modulespage() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState(false);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:8081/")
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setName(res.data.name);
          setRole(res.data.role);
          console.log(res.data.role);
        } else {
          setAuth(false);
          setMessage(res.data.Error);
        }
      })
      .catch((err) => {
        console.error("Error a la solicitud:", err);
      });
  }, []);

  //en aquest mòdul es busca la bifurcació de forma segura de la visualització de continguts. Es fa servir el token com a mètode per poder actuar.
  return (
    <div>
      <h3>Welcome -- {name} </h3>
      {auth ? (
        <div>
          {role === "professor" ? (
            <ProfessorDashboard />
          ) : role === "alumne" ? (
            <StudentDashboard />
          ) : (
            <h3>Rol no reconegut</h3>
          )}
        </div>
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
