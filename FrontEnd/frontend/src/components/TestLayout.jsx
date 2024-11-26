import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function TestLayout() {
  const location = useLocation();
  const parametersTest = location.state ? location.state.parametersTest : {};
  const { tema, concepte, dificultat } = parametersTest;

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverRandomTestQuestions", {
        params: { tema, concepte, dificultat },
      })
      .then((res) => {})
      .catch((err) => {
        console.error("Error a la sol·licitud:", err);
      });
  }, []);

  return <div>LAYOUT DEL TEST</div>;
}

export default TestLayout;
