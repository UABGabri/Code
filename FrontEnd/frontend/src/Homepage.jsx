import React from 'react'
import { useNavigate } from 'react-router-dom';

function Homepage() {
  
    const navigate = useNavigate(); // navegación

    const handleLogin = () => {
    navigate('login'); 
    };

    const handleRegister = () => {
    navigate('register'); 
    };

  return (
    <div>
      <div>
        <h1>Bienvenido</h1>
        <div>
          <button className="btn btn-light " onClick={handleLogin}>Iniciar sesión</button>
          <button className="btn btn-light" onClick={handleRegister}>Registrarse</button>
        </div>
      </div>
    </div>
  );

}

export default Homepage
