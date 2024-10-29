import { useParams, useLocation } from "react-router-dom";

function AssignaturaLayout() {
  const { id } = useParams();
  const location = useLocation();
  const { name } = location.state;

  return (
    <div>
      <h1>Detalls de la Asignatura</h1>
      <h2>ID: {id}</h2>
      <h2>Nom: {name}</h2>
    </div>
  );
}

export default AssignaturaLayout;
