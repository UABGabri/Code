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

//Connexió amb la base de dades MySQL.  
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ga21012002",
    database: "web_examen_tfg"
});


//Funció per registrar usuaris a la taula MySQl users
app.post('/register', (req, res) => {
    /*
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Ga21012002",
        database: "web_examen_tfg"
    });
*/
    const { niu, username, password, role, gmail } = req.body; 

    if (!niu || !username || !password || !role || !gmail) {
        return res.json({ error: "Tots els camps es requereixen" });
    }

    const sql = "INSERT INTO usuaris (niu, username, password, role, email) VALUES (?)"; 

    //Funció guardat amb hash de la password
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
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


//Funció per realitzar login. Utilitza jwt token per poder accedir de forma segura 
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

//Funció de verificació existencia de user gràcies a les cookies
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

//Funció per verificar al usuari, el seu rol i id
app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", name: req.name, niu:req.niu, role:req.role});
});


//Funció per fer un logout eliminant les possibles cookies
app.get('/logout', (req, res) => {

    res.clearCookie('token');
    return res.json({Status: "Success"})

})


 //Funció que retorna la informació del usuari desde la base de dades
app.get('/user', (req, res) => {  

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



//Funció que serveix per actualització del perfil a la base de dades
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

//Funció que serveix per la inserció i associació amb els professors i alumnes de una materia a la base de dades
app.post('/registerSubject', async (req, res) => { 
/*
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Ga21012002",
        database: "web_examen_tfg"
    });
*/
    const id = req.body.idAssignatura;
    const nomAssignatura = req.body.nomAssignatura;
    const niuProfessors = req.body.niuArrayProfessors;
    const niuAlumnes = req.body.niuArrayAlumnes;

    const sql = "INSERT INTO assignatures (id_assignatura, nom_assignatura) VALUES (?, ?)";
    const sqlComprobant = "SELECT * FROM usuaris WHERE niu = ?";

    const errors = [];
    const success = [];

    //Funció per insertar una assignatura a la taula Assignatures de la base de dades
    const insertSubject = () => {
        return new Promise((resolve, reject) => { 
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

    //Funció per insertar alumne a la taula alumnes_assignatura de la base de dades
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

    //Funció per insertar els professors a la taula professors_assignatura de la base de dades
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

    //Estructura ideada per esperar a que les insercions es compleixin de forma asíncrona i es torni un resultat 
    try {
        await insertSubject();

        //Es realitza una inserció per cada NIU d'alumne i professor separat per comes
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

//Funció de recuperació de les materies associades a un professor en concret
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

//Funció inserció de les preguntes a la taula preguntes de la base de dades
app.post('/addQuestion', (req, res) => { 


    const values = [

        req.body.pregunta,
        req.body.solucio_correcta,
        req.body.erronea_1,
        req.body.erronea_2,
        req.body.erronea_3,
        req.body.dificultat,
        req.body.estat,
        req.body.conceptes_materia,
        req.body.id_creador,
        parseInt(req.body.id_tema)

    ]




    const sql = `INSERT INTO preguntes (pregunta, solucio_correcta, solucio_erronia1, solucio_erronia2, solucio_erronia3, dificultat, estat, conceptes_clau, id_creador, id_tema) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

     db.query(sql, values, (error, result) => {
    
        if (error) {
            console.error("Error en la consulta:", error);
            console.log(values);
            return res.json({ Status: "Failed" });
          } else {
            return res.json(result); 
          }
    })
})

//Funció de recuperació dels temes de la assignatura per afegir preguntes
app.get('/recoverTemasAssignatura', (req, res)=>{ 

    const id_assignatura = req.query.idAssignatura;

    
    const sql = 'SELECT * FROM temes WHERE id_assignatura = ?';

    db.query(sql, [id_assignatura], (error, result) => {
    
        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
          } else {
            return res.json(result); 
          }
    })

})

//Funció de recuperació preguntes per ser avaluades pel professor
app.get('/recoverQuestions', (req, res)=>{ 

    const id_assignatura = req.query.idAssignatura;
    parseInt(id_assignatura);
    
    const sql = `SELECT * FROM preguntes JOIN temes ON preguntes.id_tema = temes.id_tema WHERE preguntes.estat = 'pendent' AND temes.id_assignatura = ?`;

    db.query(sql,[id_assignatura], (error, result)=>{

        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
          } else {
            return res.json(result); 
          }
    })
})


//Funció d'actualització d'estat de les preguntes a la taula preguntes de la base de dades
app.put('/updateQuestionAccept', (req, res) =>{

   
    const id_pregunta = parseInt(req.body.id_pregunta);
    const estat = String(req.body.estat);

   

    const sql = `UPDATE preguntes SET estat = ? WHERE id_pregunta = ?`

    db.query(sql,[estat, id_pregunta], (error, result)=>{

        if (error) {
            
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
          } else {
       
            return res.json(result); 
          }
    })
    

})

//Funció de recuperació dels alumnes assistents a una assignatura
app.get('/recoverAtendees', (req, res) =>{

    const id_assignatura = req.query.idAssignatura;
    parseInt(id_assignatura);

    const sql = `select * from usuaris JOIN alumnes_assignatures ON usuaris.niu = alumnes_assignatures.id_alumne WHERE alumnes_assignatures.id_assignatura = ?`

    db.query(sql,[id_assignatura], (error, result)=>{

        if (error) {
            
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
          } else {
       
            return res.json(result); 
          }
    })


})


//Funció de recuperació dels temes de la assignatura i conceptes per poder crear tests
app.get('/recoverElementsTest', (req, res)=>{ 

    const id_assignatura = req.query.idAssignatura;

    
    const sql = `SELECT t.nom_tema AS tema, GROUP_CONCAT(p.conceptes_clau SEPARATOR ', ') AS tots_els_conceptes FROM preguntes p JOIN temes t ON p.id_tema = t.id_tema WHERE t.id_assignatura = ? AND p.estat = 'acceptada' GROUP BY t.nom_tema`

    db.query(sql, [id_assignatura], (error, result) => {
    
        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
          } else {
            return res.json(result); 
          }
    })

})

//Funció de recuperació de deu preguntes random segons el paràmetres establerts per l'usuari
app.get('/recoverRandomTestQuestions', (req, res)=>{ 

    const tema = req.query.tema;
    const concepte = req.query.concepte;
    const dificultat = req.query.dificultat;




})




//Funció d'escolta del servidor 
app.listen(8081, () => {
    console.log("Running Server...");
});




