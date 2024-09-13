import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {


  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    role: '' 
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');


  useEffect(() => {
    const emailDomain = values.email.split('@')[1];
    if (emailDomain === 'teacher.cat') { 
      setValues(prevValues => ({ ...prevValues, role: 'Profesor' })); 
    } else {
      setValues(prevValues => ({ ...prevValues, role: 'Alumno' })); 
    }
  }, [values.email]); 

  const handleConfirmPassword = (e) => {
    e.preventDefault();
    if (values.password !== confirmPassword) {
      setError('Por favor, introduce contraseñas iguales');
      return;
    } else {
      axios.post('http://localhost:8081', values)
        .then(res => console.log(res))
        .catch(err => console.log(err)); 
      setError(''); 
      handleLogin();
    }
  };

  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/login'); // Navegar al login después de registrarse
  };

  return (
    <div>
      <h2>Registro</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="form-label" onSubmit={handleConfirmPassword}>
        <div>
          <label htmlFor="username" className="form-label">Nombre de usuario</label>
          <input
            type="text"
            name='username'
            onChange={e => setValues({ ...values, username: e.target.value })}
            className="form-control"
            id="username"
            placeholder="Ingresa tu nombre de usuario"
          />
        </div>
        <div>
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            type="email"
            name='email'
            onChange={e => setValues({ ...values, email: e.target.value })}
            className="form-control"
            id="email"
            placeholder="Ingresa tu correo"
          />
        </div>
        <div>
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            name='password'
            onChange={e => setValues({ ...values, password: e.target.value })}
            className="form-control"
            id="password"
            placeholder="Ingresa tu contraseña"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
          <input
            type="password"
            name='confirmPassword'
            onChange={e => setConfirmPassword(e.target.value)}
            className="form-control"
            id="confirmPassword"
            placeholder="Confirma tu contraseña"
          />
        </div>

        <button type="submit" className="btn btn-primary">Registrarse</button>
      </form>

      <div>
        <button className="btn btn-secondary" onClick={handleLogin}>¿Ya tienes una cuenta?</button>
      </div>
    </div>
  );
}

export default Register;

