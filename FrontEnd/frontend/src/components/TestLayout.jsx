import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function TestLayout() {
  const location = useLocation();
  const [preguntes, setPreguntes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { tema, concepte, dificultat, id_Assignatura } =
    location.state.parametersTest;

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverRandomTestQuestions", {
        params: { tema, concepte, dificultat, id_Assignatura },
      })
      .then((response) => {
        setPreguntes(response.data.Preguntes);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al recuperar las preguntas:", error);
        setLoading(false);
      });
  }, [tema, concepte, dificultat]);

  if (loading) {
    return <p>Carregant preguntes...</p>;
  }

  return (
    <div>
      <h1>Test Generat</h1>
      <ul>
        {preguntes.map((pregunta, index) => (
          <li key={index}>{pregunta.pregunta}</li>
        ))}
      </ul>
    </div>
  );
}

export default TestLayout;
