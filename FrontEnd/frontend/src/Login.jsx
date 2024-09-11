import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';



function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // navegación

    const handleRegister = () => {
        navigate('/register'); // Redirige a la página de registro
      };

    // Función para manejar el envío del formulario
    const handleSubmit = (e) => {
      e.preventDefault(); // Evita el comportamiento por defecto del formulario
  
      if (username === '' || password === '') {
        setError('Por favor, rellena todos los campos.');
        return;
      }
  
      console.log('Username:', username);
      console.log('Password:', password);
  
      setError('');
      setUsername('');
      setPassword('');
    };
  
    return (
      <div className="container mt-5">
        <h2>Iniciar sesión</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Nombre de usuario</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Iniciar sesión</button>

          <div className="mt-3">
        
        <button className="btn btn-secondary" onClick={handleRegister}>¿No tienes una cuenta?</button>
      </div>

        
        </form>
      </div>
    );
}

export default Login