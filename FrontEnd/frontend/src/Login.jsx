import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Login() {
  
  const [values, setValues] = useState({

    username: '',
    password: '',
    
  });

  const [error, setError] = useState('')


    const navigate = useNavigate(); 

    const handleRegister = () => {
        navigate('/register'); 
      };

    const handleSubmit = (e) => {
      e.preventDefault(); 
  
      if (values.username === '' || values.password === '') {
        setError('Sisplau, emplena tots els camps.');
        return;
      }else{

        axios.post('http://localhost:8081/login', values)  
        .then(res => {console.log('Resposta  del servidor:', res.data);})
        .catch(err => {console.error('Error en la solicitud:', err);});
        setError(''); 
        navigate('/')
      }
    };
  
    return (
      <div className="container mt-5">
        <h2>Iniciar sessió</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label htmlFor="username" className="form-label">Nom de usuari</label>
            <input
              type="text"
              className="form-control"
              id="username"
              onChange={(e) => setValues({...values, username: e.target.value})}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contrasenya</label>
            <input
              type="password"
              className="form-control"
              id="password"
              onChange={(e) => setValues({...values, password: e.target.value}) }
            />
          </div>
          <button type="submit" className="btn btn-primary">Iniciar sessió</button>

          <div className="mt-3">
        
        <button className="btn btn-secondary" onClick={handleRegister}>¿No tens compte?</button>
      </div>
        </form>
      </div>
    );
}

export default Login