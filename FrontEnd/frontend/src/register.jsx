import React from 'react';

function App() {
  return (
    <div className="container mt-5">
      <h2>Registro</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Nombre de usuario</label>
          <input type="text" className="form-control" id="username" placeholder="Ingresa tu nombre de usuario" />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input type="email" className="form-control" id="email" placeholder="Ingresa tu correo" />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input type="password" className="form-control" id="password" placeholder="Ingresa tu contraseña" />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
          <input type="password" className="form-control" id="confirmPassword" placeholder="Confirma tu contraseña" />
        </div>
        <button type="submit" className="btn btn-primary">Registrarse</button>
      </form>
    </div>
  );
}

export default App;
