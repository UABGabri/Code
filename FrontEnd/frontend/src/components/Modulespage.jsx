import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Dashboard from "./Dashboard";

const apiUrl = import.meta.env.VITE_API_URL;

function Modulespage() {
  const [role, setRole] = useState("");
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState("");
  const [niu, setNiu] = useState(0);
  const [loading, setLoading] = useState(true);

  // Configura axios perquè inclogui les cookies en totes les sol·licituds
  axios.defaults.withCredentials = true;

  // Recupera informació de l'usuari quan es carrega el component
  useEffect(() => {
    axios
      .get(`${apiUrl}/verify`)
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setRole(res.data.role);
          setNiu(res.data.niu);
        } else {
          setAuth(false);
          setMessage(res.data.Error || "Unknown error");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error a la solicitud:", err);
        setMessage("Error al recuperar les dades de l'usuari.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Carregant...</div>;
  }

  if (!auth || !niu || !role) {
    return (
      <div>
        {message && <h3>{message}</h3>}
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return <Dashboard id_User={niu} role_User={role} />;
}

export default Modulespage;
