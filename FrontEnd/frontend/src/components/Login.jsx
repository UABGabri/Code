import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Homepage.module.css'


function Login() {
  
  const [values, setValues] = useState({

    niu: '',
    password: '',
    
  });

  const [error, setError] = useState('')


    const navigate = useNavigate(); 

    const handleRegister = () => {
        navigate('/register'); 
      };

    const handleSubmit = (e) => {

      e.preventDefault(); 
      console.log(values);

      if (values.niu === '' || values.password === '') {
        setError('Sisplau, emplena tots els camps.');
        return;
      }else{

        /*
        axios.post('http://localhost:8081/login', values)  
        .then(res => {console.log('Resposta  del servidor:', res.data);})
        .catch(err => {console.error('Error en la solicitud:', err);});
        setError(''); 
        navigate('/');*/

        axios.post('http://localhost:8081/login', values)
        .then(res => {
          if (res.data.Status === "Success") {
            navigate('/modules');
          } else {
            alert("Error en post");
          }
        })
        .catch(err => {
          console.error("Error en la solicitud:", err);
        });


      }
    };
  
    return (


      <div className= {styles.homecontainer}>
      <div className={styles.green}>
        <h1 className={styles.logos}>UAB</h1>
      </div>
      <div className={styles.white}>
      <div className="container">
        <div className={styles.logincontainer}>
        <h2>Iniciar sessió</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label htmlFor="username" className="form-label">NIU de usuari</label>
            <input
              type="text"
              className="form-control"
              id="username"
              onChange={(e) => setValues({...values, niu: e.target.value})}
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


          <div className={styles.registerbtncontainer}>
          <button type="submit" className={styles.loginbtn}>Iniciar sessió</button>

          
            <button className={styles.loginbtn} onClick={handleRegister}>No tens compte?</button>
          </div>
        </form>
        </div>
      </div>
      </div>
      </div>
    );
}

export default Login