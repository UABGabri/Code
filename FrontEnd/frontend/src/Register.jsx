import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {


  const [values, setValues] = useState({

    username: '',
    gmail: '',
    password: '',
    role: '' 
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');


  useEffect(() => {
    const gmailDomain = values.gmail.split('@')[1];
    if (gmailDomain === 'teacher.cat') { 
      setValues(prevValues => ({ ...prevValues, role: 'Profesor' })); 
    } else {
      setValues(prevValues => ({ ...prevValues, role: 'Alumno' })); 
    }
  }, [values.gmail]); 



  const handleConfirmPassword = (event) => {

    console.log(values);
    event.preventDefault();
    if (values.password !== confirmPassword) {
      setError('Sisplau, introdueix contrasenyes iguals');
      return;
    } else {

      
      axios.post('http://localhost:8081/register', values)  
      .then(res => {console.log('Resposta del servidor:', res.data);})
      .catch(err => {console.error('Error en la solicitud:', err);});
      setError(''); 
      handleLogin(); 
      

      /*
      axios.post('http://localhost:8081/test', values.username)  
      .then(res => {console.log('Respuesta del servidor:', res.data);})
      .catch(err => {console.error('Error en la solicitud:', err);});
      setError(''); 
      handleLogin(); */
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
          <label htmlFor="username" className="form-label">Nom de usuari</label>
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
          <label htmlFor="gmail" className="form-label">Correu electrònic</label>
          <input
            type="gmail"
            name='gmail'
            onChange={e => setValues({ ...values, gmail: e.target.value })}
            className="form-control"
            id="gmail"
            placeholder="Ingresa tu correo"
          />
        </div>
        <div>
          <label htmlFor="password" className="form-label">Contrasenya</label>
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

