import express from "express";
import mysql, { createConnection } from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const salt = 10;

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', //origen específic
    methods: ['GET', 'POST', 'PUT'],// Metodes permesos
    credentials: true // Credencials necessaris
}));
app.use(cookieParser());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ga21012002",
    database: "web_examen_tfg"
});

/*
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});
*/

app.post('/register', (req, res) => {//lloc on rebem trucada post de register amb la informació necessaria
    const db = mysql.createConnection({//crear connexio amb db.
        host: "localhost",
        user: "root",
        password: "Ga21012002",
        database: "web_examen_tfg"
    });

    const { niu, username, password, role, gmail } = req.body; 

    if (!niu || !username || !password || !role || !gmail) {
        return res.json({ error: "Tots els camps es requereixen" });
    }

    const sql = "INSERT INTO usuaris (niu, username, password, role, email) VALUES (?)"; 

    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {//funció guardat amb hash de la password
        if(err) return res.json({Error:"Error hashing password"});

        const values = [
            req.body.niu,
            req.body.username,
            hash,
            req.body.role,
            req.body.gmail,
        ];

        db.query(sql, [values], (err, result) => {
            if (err) return res.json({ Error: err.message });
            return res.json({ Status: "Succeeded" });
        });
    });
});

app.post('/login', (req, res) => {
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Ga21012002",
        database: "web_examen_tfg"
    });

    const sql = 'SELECT * FROM usuaris WHERE niu = ?';

    db.query(sql, [req.body.niu], (err, data) => {

        if (err) {
            return res.json({ Error: "Error al iniciar sesión" });
        }

        if (data.length > 0) {
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                if (err) {
                    return res.json({ Error: "Error intern" });
                }
                if (response) {
                    const role = data[0].role;
                    const name = data[0].name;
                    const niu = data[0].niu;
                    const token = jwt.sign({ name, niu, role }, "jwt-secret-key", { expiresIn: '1d' });

                    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'None' });

                    res.json({ Status: "Success" });

                } else {
                    res.json({ Status: "Contrasenya incorrecta" });
                }
            });
        } else {
            return res.json({ Error: "NIU no existent" });
        }
    });
});


const verifyUser = (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res.json({ Error: "No autenticació" });
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                return res.json({ Error: "Token incorrecte" });
            } else {
                req.name = decoded.name;
                req.niu = decoded.niu;
                req.role = decoded.role;
                next();
            }
        });
    }
};

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", name: req.name, niu:req.niu, role:req.role});
});



app.get('/logout', (req, res) => {

    res.clearCookie('token');
    return res.json({Status: "Success"})

})



app.get('/user', (req, res) => {  //api que retorna la informació del usuari 

    const token = req.cookies.token;

    if (!token) {
        return res.json({ Error: "No hi ha token, access denegat" });
      }
    
      jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
          return res.json({ Error: "Token invàlid" });
        }
    
        const niu = decoded.niu;

        console.log(decoded);
        
        const db = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "Ga21012002",
            database: "web_examen_tfg"

        });

        const sql = 'SELECT * FROM usuaris WHERE niu = ?';

        db.query(sql, [niu], (err, result) => {

            if (result.length > 0) {

                
                return res.json({ user: result[0], Status: "Succeeded" });
            } else {
                return res.json({ Error: "Usuari no trobat" });
            }
        });

        
    });


})




app.put('/updateUser', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ Error: "No hi ha token, accés denegat" });
    }

    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.json({ Error: "Token invàlid" });
        }

        const niu = decoded.niu;
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.json({ Error: "Tots els camps són obligatoris" });
        }

     
        bcrypt.hash(password.toString(), salt, (err, hash) => {
            if (err) return res.json({ Error: "Error encriptant la contrasenya" });

            const sql = 'UPDATE usuaris SET username = ?, email = ?, password = ? WHERE niu = ?';
            db.query(sql, [username, email, hash, niu], (err, result) => {
                if (err) return res.json({ Error: "Error actualitzant l'usuari" });
                
                if (result.affectedRows > 0) {
                    return res.json({ Status: "Success", Message: "Dades actualitzades correctament" });
                } else {
                    return res.json({ Error: "Usuari no trobat" });
                }
            });
        });
    });
});


app.post('/registerSubject', async (req, res) => {


    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Ga21012002",
        database: "web_examen_tfg"
    });

    const id = req.body.idAssignatura;
    const nomAssignatura = req.body.nomAssignatura;
    const niuProfessors = req.body.niuArrayProfessors;
    const niuAlumnes = req.body.niuArrayAlumnes;

    const sql = "INSERT INTO assignatures (id_assignatura, nom_assignatura) VALUES (?, ?)";
    const sqlComprobant = "SELECT * FROM usuaris WHERE niu = ?";

    const errors = [];
    const success = [];

    const insertSubject = () => {
        return new Promise((resolve, reject) => { //fer promesa ja que les consultes triguen a executar
            db.query(sql, [id, nomAssignatura], (err) => {
                if (err) {
                    errors.push("Error insertar Asignatura");
                    reject();
                } else {
                    success.push("Success insertar Asignatura");
                    resolve();
                }
            });
        });
    };

    const checkAndInsertAlumne = (niu) => {
        return new Promise((resolve, reject) => {
            db.query(sqlComprobant, [niu], (err, result) => { //comprobació existencia alumne
                if (err || result.length === 0) {
                    errors.push("Error, un usuari alumne no existent: " + niu);
                    reject();
                } else {
                    const sqlAlumneInsert = "INSERT INTO alumnes_assignatures (id_alumne, id_assignatura) VALUES (?, ?)";
                    db.query(sqlAlumneInsert, [niu, id], (err) => { //inserció alumne
                        if (err) {
                            errors.push("Error, usuari alumne no afegit a la taula alumnes_assignatures: " + niu);
                            reject();
                        } else {
                            success.push("Alumne insertat: " + niu);
                            resolve();
                        }
                    });
                }
            });
        });
    };

    const checkAndInsertProfessor = (niu) => {
        return new Promise((resolve, reject) => {
            db.query(sqlComprobant, [niu], (err, result) => { //comprobació existencia professor
                if (err || result.length === 0) {
                    errors.push("Error, un usuari professor no existent: " + niu);
                    reject();
                } else {
                    const sqlProfessorInsert = "INSERT INTO professors_assignatures (id_professor, id_assignatura) VALUES (?, ?)";
                    db.query(sqlProfessorInsert, [niu, id], (err) => { //inserció professor
                        if (err) {
                            errors.push("Error, usuari professor no afegit a la taula professors_assignatures: " + niu);
                            reject();
                        } else {
                            success.push("Professor insertat: " + niu);
                            resolve();
                        }
                    });
                }
            });
        });
    };

    try {
        await insertSubject();

        await Promise.all(niuAlumnes.map(checkAndInsertAlumne));
        await Promise.all(niuProfessors.map(checkAndInsertProfessor));

        if (errors.length > 0) {
            return res.json({ Status: "Failed", Messages: errors });
        } else {
            return res.json({ Status: "Success", Messages: success });
        }
    } catch (error) {
        return res.json({ Status: "Failed", Messages: errors });
    } 
});

app.post('/recoverSubjects', (req, res) => {

    const idProfessor = req.body.professorId;


    const sql = 'SELECT a.id_assignatura, a.nom_assignatura FROM assignatures a JOIN professors_assignatures pa ON a.id_assignatura = pa.id_assignatura WHERE pa.id_professor = ?';

    db.query(sql, [idProfessor], (error, result) => {
        if (error) {
          console.error("Error en la consulta:", error);
          return res.json({ Status: "Failed" });
        } else {
          return res.json(result); 
        }
      });
}) 

app.post('/addQuestion', (req, res) => {

    const { pregunta, solucio_correcta, solucio_erronia1, solucio_erronia2, solucio_erronia3, dificultat, estat, conceptes_clau } = req.body;


    const sql = `INSERT INTO pregunta (pregunta, solucio_correcta, solucio_erronia1, solucio_erronia2, solucio_erronia3, dificultat, estat, conceptes_clau, id_creador, id_tema) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?)`;

    //necesario un id de un tema y un creador. Hay que recuperar el niu del creador y inventarse un id para el tema. 
})

app.listen(8081, () => {
    console.log("Running Server...");
});




