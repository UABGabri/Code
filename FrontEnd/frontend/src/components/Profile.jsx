import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [values, setValues] = useState({
    niu: "", //valor no intercanviable
    username: "",
    gmail: "",
    password: "",
    role: "", //valor no intercanviable
  });

  const [isEditing, setIsEditing] = useState({
    username: false,
    password: false,
    email: false,
  });

  useEffect(() => {
    axios
      .post("http://localhost:8081/user", values)
      .then((res) => {
        console.log("Resposta del servidor:", res.data);
      })
      .catch((err) => {
        console.error("Error a la solicitud:", err);
      });
  }, []);

  return <div></div>;
}

export default Profile;
