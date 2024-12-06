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
    methods: ['GET', 'POST', 'PUT', 'DELETE'],// Metodes permesos
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

        //console.log(decoded);
        
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


//Funció de recuperació dels temes associats a una assignatura pel curs

app.get('/recoverTemesAssignatura', (req, res) => {

    const { idAssignatura } = req.query.idAssignatura;

    const id = parseInt(req.query.idAssignatura,10);
    const sql = "SELECT * FROM temes WHERE id_assignatura = ?";
    db.query(sql, [id], (error, result) => {
      if (error) {
        console.error("Error al recuperar els temes:", error);
        return res.json({ success: false, message: "Error al recuperar els temes" });
      }
  
      return res.json(result);
    });

});


//Funció creació d'un tema per una assignatura

app.post('/createTema', (req,res) => {
    const { idAssignatura, name } = req.body;

    console.log(typeof(idAssignatura));

    if (!name) {
      return res.json({ success: false, message: "El nom és obligatori" });
    }
  
    const sql = "INSERT INTO temes (id_assignatura, nom_tema) VALUES (?, ?)";
    db.query(sql, [idAssignatura, name], (error, result) => {
      if (error) {
        console.error("Error al inserir el tema:", error);
        return res.json({ success: false, message: "Error en crear el tema" });
      }
  
      return res.json({ success: true, message: "Tema creat amb èxit" });
    });

})

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
app.post('/addQuestion', async (req, res) => {
    const {
        pregunta,
        solucio_correcta,
        erronea_1,
        erronea_2,
        erronea_3,
        dificultat,
        conceptes_materia,
        id_creador,
        id_tema,
    } = req.body;

    if (
        !pregunta ||
        !solucio_correcta ||
        !erronea_1 ||
        !erronea_2 ||
        !erronea_3 ||
        !dificultat ||
        !conceptes_materia ||
        !id_creador ||
        !id_tema
    ) {
        return res.json({ Status: "Failed", Message: "Falten camps obligatoris." });
    }

    const dbQuery = (sql, values) =>
        new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

    try {
        // Insertar la pregunta
        const questionSql = `
            INSERT INTO preguntes 
            (pregunta, solucio_correcta, solucio_erronia1, solucio_erronia2, solucio_erronia3, dificultat, estat, id_creador, id_tema) 
            VALUES (?, ?, ?, ?, ?, ?, 'pendent', ?, ?)`;

        const questionResult = await dbQuery(questionSql, [
            pregunta,
            solucio_correcta,
            erronea_1,
            erronea_2,
            erronea_3,
            dificultat,
            id_creador,
            id_tema,
        ]);

        const questionId = questionResult.insertId;

        // Insertar conceptes
        const conceptos = conceptes_materia.split(",").map((concept) => concept.trim());
        const conceptIds = [];
        for (const concept of conceptos) {
            let conceptId;

            // Verificar si el concepte ja existeix
            const existingConcept = await dbQuery(
                "SELECT id_concepte FROM conceptes WHERE nom_concepte = ?",
                [concept]
            );

            if (existingConcept.length > 0) {
                conceptId = existingConcept[0].id_concepte;
            } else {
                // Insertar nou concepte
                const conceptInsert = await dbQuery(
                    "INSERT INTO conceptes (nom_concepte) VALUES (?)",
                    [concept]
                );
                conceptId = conceptInsert.insertId;
            }

            conceptIds.push(conceptId);
        }

        // Associar conceptos amb la pregunta
        const conceptQuestionSql = `
            INSERT INTO preguntes_conceptes (id_pregunta, id_concepte) VALUES (?, ?)`;
        for (const conceptId of conceptIds) {
            await dbQuery(conceptQuestionSql, [questionId, conceptId]);
        }

        return res.json({ Status: "Success", Message: "Pregunta afegida correctament!" });
    } catch (error) {
        console.error("Error al processar la pregunta:", error);
        return res.json({ Status: "Failed", Message: "Error en el servidor." });
    }
});



app.delete('/deleteQuestion', (req,res)=>{

    const id_Pregunta = req.query.idPregunta;

    //console.log(id_Pregunta);

    const sql = 'DELETE FROM preguntes WHERE id_pregunta = ?'

    db.query(sql, [id_Pregunta], (error, result) => {
    
        if (error) {
            console.error("Error en la consulta:", error);
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
app.get('/recoverElementsTest', (req, res) => {

    const id_assignatura = req.query.idAssignatura;
    parseInt(id_assignatura,10);

    const sql = `SELECT t.id_tema, t.nom_tema AS tema, GROUP_CONCAT(c.nom_concepte SEPARATOR ', ') AS tots_els_conceptes
FROM temes t
LEFT JOIN preguntes p ON t.id_tema = p.id_tema AND p.estat = 'acceptada'
LEFT JOIN preguntes_conceptes pc ON p.id_pregunta = pc.id_pregunta
LEFT JOIN conceptes c ON pc.id_concepte = c.id_concepte
WHERE t.id_assignatura = ?
GROUP BY t.id_tema, t.nom_tema

    `;

    db.query(sql, [id_assignatura], (error, result) => {
        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
        } else {
            return res.json(result);
        }
    });
});

//Funció de creació de test professors
app.post('/generarTest', (req, res) => {
    const { idAssignatura, idTema, idCreador, nombreTest } = req.body;
    const llaveAcceso = Math.random().toString(36).substr(2, 8);
  
    const sqlInsertTest = `
      INSERT INTO tests (nom_test, data_creacio, clau_acces, id_creador, id_assignatura, id_tema)
      VALUES (?, NOW(), ?, ?, ?, ?)
    `;
  
    db.query(sqlInsertTest, [nombreTest, llaveAcceso, idCreador, idAssignatura, idTema], (error, result) => {
      if (error) {
        console.error("Error al crear el test:", error);
        return res.status(500).json({ Status: "Error al crear el test" });
      }
  
      const idTest = result.insertId;
  
      const sqlGetQuestions = `
        SELECT p.id_pregunta 
        FROM preguntes p
        JOIN preguntes_conceptes pc ON p.id_pregunta = pc.id_pregunta
        WHERE p.id_tema = ? AND p.id_assignatura = ?
        ORDER BY RAND() LIMIT 10
      `;
      
      db.query(sqlGetQuestions, [idTema, idAssignatura], (error, questions) => {
        if (error) {
          console.error("Error al obtenir les preguntas:", error);
          return res.json({ Status: "Error al obtenir les preguntas" });
        }
  
        const sqlInsertTestQuestions = `
          INSERT INTO test_preguntes (id_test, id_pregunta) VALUES ?
        `;
        
        const questionsToInsert = questions.map(question => [idTest, question.id_pregunta]);
        
        db.query(sqlInsertTestQuestions, [questionsToInsert], (error) => {
          if (error) {
            console.error("Error al asociar las preguntas al test:", error);
            return res.json({ Status: "Error al associar les preguntes al test" });
          }
          
          return res.json({
            Status: "Test generado correctamente",
            llaveAcceso,
            idTest,
          });
        });
      });
    });
  });
  


//Funció de recuperació de deu preguntes random segons el paràmetres establerts per l'usuari
app.get('/recoverRandomTestQuestions', async (req, res) => { 
    const tema = req.query.tema;
    const concepte = req.query.concepte;
    const dificultat = req.query.dificultat;
    const idAssignatura = req.query.idAssignatura;

    if (!tema || !concepte || !dificultat) {
        return res.json({ Status: "Failed", Message: "Falten paràmetres requerits: tema, concepte o dificultat." });
    }

    const sqlGetTemaId = "SELECT id_tema FROM temes WHERE nom_tema = ?";
    const sqlGetConcepteId = "SELECT id_concepte FROM conceptes WHERE nom_concepte = ?";
    const sqlGetQuestions = `
        SELECT p.* FROM preguntes p
        INNER JOIN preguntes_conceptes pc ON p.id_pregunta = pc.id_pregunta
        WHERE p.id_tema = ? 
        AND pc.id_concepte = ? 
        AND p.dificultat = ? 
        AND p.estat = 'acceptada'
        ORDER BY RAND() LIMIT 10
    `;

    const errors = [];
    const success = [];

    const getTemaId = () => {
        return new Promise((resolve, reject) => {
            db.query(sqlGetTemaId, [tema], (err, result) => {
                if (err || result.length === 0) {
                    errors.push("El tema proporcionat no existeix.");
                    reject();
                } else {
                    success.push("ID del tema recuperat correctament.");
                    resolve(result[0].id_tema);
                }
            });
        });
    };






    const getConcepteId = () => {
        return new Promise((resolve, reject) => {
            db.query(sqlGetConcepteId, [concepte], (err, result) => {
                if (err || result.length === 0) {
                    errors.push("El concepte proporcionat no existeix.");
                    reject();
                } else {
                    success.push("ID del concepte recuperat correctament.");
                    resolve(result[0].id_concepte);
                }
            });
        });
    };

    const getQuestions = (idTema, idConcepte) => {
        return new Promise((resolve, reject) => {
            db.query(sqlGetQuestions, [idTema, idConcepte, dificultat], (err, result) => {
                if (err || result.length === 0) {
                    errors.push("No s'han trobat preguntes que coincideixin amb els criteris.");
                    reject();
                } else {
                    success.push("Preguntes recuperades correctament.");
                    resolve(result);
                }
            });
        });
    };

    try {
        const idTema = await getTemaId();
        const idConcepte = await getConcepteId();
        const preguntes = await getQuestions(idTema, idConcepte);

        if (errors.length > 0) {
            return res.json({ Status: "Partial Success", Messages: errors, Preguntes: preguntes || [] });
        } else {
            return res.json({ Status: "Success", Messages: success, Preguntes: preguntes });
        }
    } catch (error) {
        return res.json({ Status: "Failed", Messages: errors });
    }
});




app.get('/recoverSelectedTestWithKeyQuestions', (req, res) =>{


    const idTest = parseInt(req.query.idTest);
 
    
    const sql = 'SELECT p.id_pregunta,p.pregunta,p.solucio_correcta,solucio_erronia1,solucio_erronia2, solucio_erronia3 FROM test_preguntes pt JOIN preguntes p ON pt.id_pregunta = p.id_pregunta WHERE pt.id_test = ?';
    
    

    db.query(sql, [idTest], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ status: "Failed", error });
        }
        res.json({ status: "Success", Preguntes:result });
    });


})

app.get('/recoverPreguntesTema', (req, res) =>{

    //console.log("Here Am II");
    const idTema = req.query.id_tema; 
    //console.log("ID Tema recibido en el backend:", idTema);

    if (!idTema) {
        console.error("ID Tema no proporcionat");
        return res.json({ error: "ID Tema es requerit" });
    }

    const sql = 'SELECT * FROM preguntes WHERE id_tema = ?';
    db.query(sql, [idTema], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ Status: "Failed" });
        } else {
            return res.json(result);
        }
    });



})

//Funció creació de test pel professor

app.post('/createTest', async (req, res) => {
    const { nom_test, id_creador, id_assignatura, idTema} = req.body;
    const clau_acces = Math.random().toString(36).substr(2, 8);
    const data_creacio = new Date();

    parseInt(id_creador,10)
    parseInt(id_assignatura,10)
    parseInt(idTema,10)
   
    const sql = ' INSERT INTO tests (nom_test, data_creacio, clau_acces, id_creador, id_assignatura, id_tema) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(sql, [nom_test, data_creacio, clau_acces, id_creador, id_assignatura, idTema ], (error, result) => {
        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
        } else {
            return res.json({success: true, id_test: result.insertId} );
        }
    });

   
});


app.post('/insertQuestionsTest', (req, res) => {

    const idTest = req.body.id_test;
    parseInt(idTest);
    const preguntesTest = req.body.questions;

    const sql = 'INSERT INTO test_preguntes (id_test, id_pregunta) VALUES ?';

    const values = preguntesTest.map((idPregunta) => [idTest, idPregunta]);

    db.query(sql, [values], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.status(500).json({ status: "Failed" });
        } else {
            return res.json({ status: "Success", result });
        }
    });
});


app.get('/recoverTestsTema', (req, res) =>{


const idTema = req.query.id_tema;

parseInt(idTema, 10);
const sql = 'SELECT id_test, nom_test FROM tests WHERE id_tema = ?'

db.query(sql, [idTema], (error, result) => {
    if (error) {
        console.error("Error a la consulta:", error);
        return res.json({ status: "Failed" });
    } else {
        return res.json({ status: "Success", result });
    }
});

})


//Funció per validar clau accés a Test
app.post('/validateTestAccess', (req, res) => {

    const { id_test, access_key } = req.body;


    const sql = 'SELECT id_test FROM tests WHERE id_test = ? AND clau_acces = ?';

    db.query(sql, [id_test, access_key], (error, results) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ status: "Failed", message: "Error del servidor." });
        }

        if (results.length > 0) {
            return res.json({ status: "Success", message: "Clau d'accés vàlida." });
        } else {
            return res.json({ status: "Failed", message: "Clau d'accés incorrecta." });
        }
    });
});



//Funció d'escolta del servidor 
app.listen(8081, () => {
    console.log("Running Server...");
});




