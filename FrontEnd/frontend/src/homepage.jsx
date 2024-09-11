import React from 'react'
import './Homepage.css'
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
      <div className="text-center">
        <h1>Bienvenido</h1>
        <div className="mt-4">
          <button className="btn btn-light me-2" onClick={handleLogin}>Iniciar sesión</button>
          <button className="btn btn-light" onClick={handleRegister}>Registrarse</button>
        </div>
      </div>
    </div>
  );

}

export default Homepage