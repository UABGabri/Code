import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
        } else {
          setAuth(false);
          setMessage(res.data.Error);
        }
      })
      .catch((err) => {
        console.error("Error a la solicitud:", err);
      });
  }, []);

  return (
    <div>
      {auth ? (
        <div>
          <h3>
            Authorized -- {name} and {role}
          </h3>
        </div>
      ) : (
        <div>
          <h3>{message}</h3>
          <h3>NO AUTHORIZED</h3>
          <Link to="/login">Login</Link>
        </div>
      )}
    </div>
  );
}

export default Modulespage;
