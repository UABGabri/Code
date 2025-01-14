import express from "express";
import mysql, { createConnection } from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from 'fs';
import csvParser from 'csv-parser';
import { type } from "os";



const salt = 10;
const saltRounds = 10;

const upload = multer({ dest: "uploads/" });

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


//Funció per registrar usuaris a la taula MySQl users. Valida si existeix NIU i Email.
app.post('/register', (req, res) => {
    const { niu, username, password, role, gmail } = req.body;

    // Verificar que todos los campos estén presentes
    if (!niu || !username || !password || !role || !gmail) {
        return res.json({ error: "Tots els camps es requereixen" });
    }

    // Verificar si el NIU ya existe
    const checkNiuSql = "SELECT * FROM usuaris WHERE niu = ?";
    db.query(checkNiuSql, [niu], (err, result) => {
        if (err) return res.json({ Error: err.message });


        if (result.length > 0) {
            return res.json({ error: "El NIU ja existeix" });
        }

 
        const checkEmailSql = "SELECT * FROM usuaris WHERE email = ?";
        db.query(checkEmailSql, [gmail], (err, result) => {
            if (err) return res.json({ Error: err.message });

          
            if (result.length > 0) {
                return res.json({ error: "El correu electrònic ja està registrat" });
            }

       
            const sql = "INSERT INTO usuaris (niu, username, password, role, email) VALUES (?)";

    
            bcrypt.hash(password.toString(), salt, (err, hash) => {
                if (err) return res.json({ Error: "Error hashing password" });

                const values = [niu, username, hash, role, gmail];
                db.query(sql, [values], (err, result) => {
                    if (err) return res.json({ Error: err.message });
                    return res.json({ Status: "Succeeded" });
                });
            });
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
            return res.json({ Error: "Error al iniciar sessió" });
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
                    // Retornant error en cas de contrasenya incorrecta
                    return res.json({ Error: "Contrasenya incorrecta" });
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
        return res.json({ Error: "No hi ha token, accés denegat" });
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
    const id_User = req.body.id_User;
    const id_Subject = req.body.id_Subject;
    const subject_Name = req.body.subject_Name;

    //console.log(id_User, id_Subject, subject_Name)

    
    const sqlInsert = "INSERT INTO assignatures (id_assignatura, nom_assignatura) VALUES (?, ?)";
    const sqlCheckExistence = "SELECT * FROM assignatures WHERE id_assignatura = ?"; // Consulta per comprovar si ja existeix l'ID de l'assignatura
    const sqlComprobant = "SELECT * FROM usuaris WHERE niu = ?"; // Consulta per comprovar si el professor existeix

    const errors = [];
    const success = [];

    // Funció per comprovar si ja existeix l'ID de l'assignatura
    const checkIfSubjectExists = () => {
        return new Promise((resolve, reject) => {
            db.query(sqlCheckExistence, [id_Subject], (err, result) => {
                if (err) {
                    errors.push("Error al comprovar la existència de l'assignatura");
                    reject();
                } else if (result.length > 0) {
                    errors.push("Error: Ja existeix una assignatura amb aquest ID.");
                    reject();
                } else {
                    resolve();
                }
            });
        });
    };

    // Funció per insertar l'assignatura a la base de dades
    const insertSubject = () => {
        return new Promise((resolve, reject) => {
            db.query(sqlInsert, [id_Subject, subject_Name], (err) => {
                if (err) {
                    errors.push("Error en inserir l'assignatura");
                    reject();
                } else {
                    success.push("Assignatura inserida correctament");
                    resolve();
                }
            });
        });
    };

    // Funció per afegir el professor a la taula professors_assignatures
    const checkAndInsertProfessor = (niu) => {
        return new Promise((resolve, reject) => {
            db.query(sqlComprobant, [id_User, id_Subject], (err, result) => {
                if (err || result.length === 0) {
                    errors.push("Error, usuari professor no existent: " + niu);
                    reject();
                } else {
                    const sqlProfessorInsert = "INSERT INTO professors_assignatures (id_professor, id_assignatura) VALUES (?, ?)";
                    db.query(sqlProfessorInsert, [id_User, id_Subject], (err) => {
                        if (err) {
                            errors.push("Error, professor no afegit a la taula professors_assignatures: " + niu);
                            reject();
                        } else {
                            success.push("Professor inserit correctament: " + niu);
                            resolve();
                        }
                    });
                }
            });
        });
    };

    try {
        // Primer, comprovem si l'assignatura ja existeix
        await checkIfSubjectExists();

        // Insertar l'assignatura a la taula assignatures
        await insertSubject();

        // Afegir el professor a la taula professors_assignatures
        await Promise.all(checkAndInsertProfessor (id_User));

      
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

    const idAssignatura = parseInt(req.query.Id_Assignatura, 10); 
    //console.log(idAssignatura)

    if (!idAssignatura) {
        return res.json({ success: false, message: "Id_Assignatura no proporcionat o inválid" });
    }

    const sql = "SELECT * FROM temes WHERE id_assignatura = ?";
    db.query(sql, [idAssignatura], (error, result) => {
        if (error) {
            console.error("Error al recuperar els temes:", error);
            return res.json({ success: false, message: "Error al recuperar els temes" });
        }

        return res.json(result);
    });
});


//Funció creació d'un tema per una assignatura

app.post('/createTema', (req,res) => {

    const { Id_Assignatura, name } = req.body;

   

    if (!name) {
      return res.json({ success: false, message: "El nom és obligatori" });
    }
  
    const sql = "INSERT INTO temes (id_assignatura, nom_tema) VALUES (?, ?)";
    db.query(sql, [Id_Assignatura, name], (error, result) => {
      if (error) {
        console.error("Error al inserir el tema:", error);
        return res.json({ success: false, message: "Error en crear el tema porque si" });
      }
  
      return res.json({ success: true, message: "Tema creat amb èxit" });
    });

})


//Funció d'eliminació d'una assignatura. 
app.delete('/deleteSubject', (req, res) => {
    const id_subject = parseInt(req.query.id_subject);
  
    const sql = "DELETE FROM assignatures WHERE id_assignatura = ?";
  
    db.query(sql, [id_subject], (error, result) => {
      if (error) {
        console.error("Error al eliminar l'assignatura:", error);
        return res.json({ success: false, message: "Error al eliminar l'assignatura" });
      }
  
      if (result.affectedRows > 0) {
        return res.json({ success: true, message: "Assignatura eliminada correctament!" });
      } else if (result.affectedRows === 0) {
        return res.json({ success: false, message: "No existeix la assignatura" });
      }
    });
  });
  

//Funció d'eliminació d'un tema
app.delete('/deleteTheme', (req, res)=>{

    const id_tema = parseInt(req.body.id_tema);


    const sql= "DELETE FROM temes WHERE id_tema = ?";

    db.query(sql, [id_tema], (error, result) => {
        if (error) {
          console.error("Error al eliminar el tema", error);
          return res.json({ success: false, message: "Error en eliminar el tema" });
        }
    
        return res.json({ success: true, message: "Tema eliminat amb èxit" });
      });


})

//Funció de recuperació de les materies associades a un professor en concret
app.post('/recoverSubjects', (req, res) => { 

    const id_User = req.body.idUser;
    const role_User = req.body.roleUser;


    if(role_User === "professor"){

        const sql = `SELECT a.id_assignatura, a.nom_assignatura 
        FROM assignatures a 
        JOIN professors_assignatures pa 
        ON a.id_assignatura = pa.id_assignatura 
        WHERE pa.id_professor = ?`;

        db.query(sql, [id_User], (error, result) => {
            if (error) {
              console.error("Error en la consulta:", error);
              return res.json({ Status: "Failed" });
            } else {
              return res.json(result); 
            }
          });

    }
    else if (role_User === "alumne"){
        
        const sql = `SELECT a.id_assignatura, a.nom_assignatura 
        FROM assignatures a 
        JOIN alumnes_assignatures pa ON a.id_assignatura = pa.id_assignatura 
        WHERE pa.id_alumne = ?`;

        db.query(sql, [id_User], (error, result) => {
            if (error) {
              console.error("Error en la consulta:", error);
              return res.json({ Status: "Failed" });
            } else {
              return res.json(result); 
            }
          });
    }
    
}) 


//Funció recuperació preguntes pendents
app.get('/pendentQuestions', (req, res)=>{


    const user = parseInt(req.query.Id_User);
    const estat = 'pendent'


    const sql = `SELECT count(*) AS count FROM preguntes WHERE estat = ? AND id_creador = ?`

    db.query(sql, [estat, user], (error, result) => {
        if (error) {
          console.error("Error en la consulta:", error);
          return res.json({ Status: "Failed", message:"Error a la consulta" });
        } else {
            const count = parseInt(result[0]?.count || 0);
            return res.json({ Status: "Sucess", count });
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
        // Verificar si hi ha pregunta igual
        const existingQuestionSql = `
            SELECT id_pregunta 
            FROM preguntes 
            WHERE 
                pregunta = ? AND 
                solucio_correcta = ? AND 
                solucio_erronia1 = ? AND 
                solucio_erronia2 = ? AND 
                solucio_erronia3 = ? AND 
                dificultat = ? AND 
                id_tema = ?
        `;
        const existingQuestion = await dbQuery(existingQuestionSql, [
            pregunta,
            solucio_correcta,
            erronea_1,
            erronea_2,
            erronea_3,
            dificultat,
            id_tema,
        ]);

        if (existingQuestion.length > 0) {
            return res.json({
                Status: "Failed",
                Message: "Ja existeix una pregunta amb els mateixos paràmetres.",
            });
        }

        // Insertar nova pregunta
        const questionSql = `
            INSERT INTO preguntes 
            (pregunta, solucio_correcta, solucio_erronia1, solucio_erronia2, solucio_erronia3, dificultat, estat, id_creador, id_tema) 
            VALUES (?, ?, ?, ?, ?, ?, 'pendent', ?, ?)
        `;

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

        // Obtener els conceptes de la matèria
        const conceptes = [...new Set(conceptes_materia.split(",").map((concept) => concept.trim()))];

        const conceptIds = [];
        for (const concept of conceptes) {
            let conceptId;

            // Verificar si el concepto ja existeix
            const existingConcept = await dbQuery(
                "SELECT id_concepte FROM conceptes WHERE nom_concepte = ?",
                [concept]
            );

            if (existingConcept.length > 0) {
                conceptId = existingConcept[0].id_concepte;

                // Verificar si existeix relació concepte amb tema
                const existingConceptTema = await dbQuery(
                    "SELECT * FROM conceptes_temes WHERE id_concepte = ? AND id_tema = ?",
                    [conceptId, id_tema]
                );

                if (existingConceptTema.length === 0) {
                    // Relacionar concepto amb tema si no existeix
                    await dbQuery(
                        "INSERT INTO conceptes_temes (id_concepte, id_tema) VALUES (?, ?)",
                        [conceptId, id_tema]
                    );
                }
            } else {
                // Insertar nou  concepte i associar al tema
                const conceptInsert = await dbQuery(
                    "INSERT INTO conceptes (nom_concepte) VALUES (?)",
                    [concept]
                );
                conceptId = conceptInsert.insertId;

                await dbQuery(
                    "INSERT INTO conceptes_temes (id_concepte, id_tema) VALUES (?, ?)",
                    [conceptId, id_tema]
                );
            }

            conceptIds.push(conceptId);
        }

        // Associar conceptes amb preguntes
        const conceptQuestionSql = `INSERT INTO preguntes_conceptes (id_pregunta, id_concepte) VALUES (?, ?)`;
        for (const conceptId of conceptIds) {
            await dbQuery(conceptQuestionSql, [questionId, conceptId]);
        }

        return res.json({ Status: "Success", Message: "Pregunta afegida correctament!" });
    } catch (error) {
        console.error("Error al processar la pregunta:", error);
        return res.json({ Status: "Failed", Message: "Error en el servidor." });
    }
});



// Funció per afegir el concepte i la seva relació amb el tema
app.put("/updateQuestion", async (req, res) => {
    const {
      id_pregunta,
      nom_tema,
      pregunta,
      solucio_correcta,
      solucio_erronia1,
      solucio_erronia2,
      solucio_erronia3,
      conceptes,
      dificultat,
      Id_Assignatura
    } = req.body;
  

    const sqlSelectTopic = "SELECT id_tema FROM temes WHERE nom_tema = ? AND id_assignatura = ?";
    // Pas 1: Recuperem l'ID del tema per posteriors execucions
    try {
      const temaResult = await queryDatabase(sqlSelectTopic, [nom_tema, Id_Assignatura]);

      if (temaResult.length === 0) {
        return res.json({ Estat: "Error", error: "El tema especificat no existeix." });
      }

      const id_tema = temaResult[0].id_tema;

      const sqlUpdateQuestion = `UPDATE preguntes SET pregunta = ?, solucio_correcta = ?, solucio_erronia1 = ?, 
            solucio_erronia2 = ?, solucio_erronia3 = ?, dificultat = ?, id_tema = ?
            WHERE id_pregunta = ?`;

      // Pas 2: Actualitzem la pregunta
      await queryDatabase(sqlUpdateQuestion, [pregunta, solucio_correcta, solucio_erronia1, solucio_erronia2, solucio_erronia3, dificultat, id_tema, id_pregunta]);

      // Pas 3: Processar els conceptes. Aqui pot haver bifuració segons si existeix o no el concepte i el id del tema escollit.
      const conceptesArray = conceptes.split(",").map((c) => c.trim());
      const conceptIds = [];

      let conceptesProcessats = 0;
      const totalConceptes = conceptesArray.length;

      for (let i = 0; i < conceptesArray.length; i++) {
        const concepte = conceptesArray[i];

        // Comprovem si el concepte ja existeix a la base de dades
        const sqlConcepteExist = "SELECT id_concepte FROM conceptes WHERE nom_concepte = ?";

        try {
          const conceptResult = await queryDatabase(sqlConcepteExist, [concepte]);

          let conceptId;
          if (conceptResult.length > 0) {
            // Si el concepte existeix, agafem el seu ID per posterior ús
            conceptId = conceptResult[0].id_concepte;

            const sqlConcepteTema = "SELECT * FROM conceptes_temes WHERE id_concepte = ? AND id_tema = ?";
            const conceptTemaResult = await queryDatabase(sqlConcepteTema, [conceptId, id_tema]);

            if (conceptTemaResult.length === 0) {
              // Si no existeix la relació concepte-tema, es crea
              const sqlInsertConcepteTema = "INSERT INTO conceptes_temes (id_concepte, id_tema) VALUES (?, ?)";
              await queryDatabase(sqlInsertConcepteTema, [conceptId, id_tema]);
            }
          } else {
            // Si no existeix el concepte, afegim el concepte a la base de dades
            const sqlInsertConcepte = "INSERT INTO conceptes (nom_concepte) VALUES (?)";
            const insertResult = await queryDatabase(sqlInsertConcepte, [concepte]);

            conceptId = insertResult.insertId;

            // Verifiquem si cal crear una relació amb el tema (pot haver ja una)
            const sqlConcepteTema = "SELECT * FROM conceptes_temes WHERE id_concepte = ? AND id_tema = ?";
            const conceptTemaResult = await queryDatabase(sqlConcepteTema, [conceptId, id_tema]);

            if (conceptTemaResult.length === 0) {
              // Si no existeix, creem la relació
              const sqlInsertConcepteTema = "INSERT INTO conceptes_temes (id_concepte, id_tema) VALUES (?, ?)";
              await queryDatabase(sqlInsertConcepteTema, [conceptId, id_tema]);
            }
          }

          // Afegim el concepte a la llista per a la relació amb la pregunta
          conceptIds.push(conceptId);
          conceptesProcessats++;

          // Si ja hem processat tots els conceptes, passem a actualitzar les relacions de la pregunta
          if (conceptesProcessats === totalConceptes) {
            // Pas 4: Actualitzar les relacions a `preguntes_conceptes`

            const sqlDeletePreguntesConceptes = "DELETE FROM preguntes_conceptes WHERE id_pregunta = ?";
            await queryDatabase(sqlDeletePreguntesConceptes, [id_pregunta]);

            // Inserim les noves relacions amb els conceptes
            let insertsPendents = conceptIds.length;
            const sqlInsertPreguntesConceptes = "INSERT INTO preguntes_conceptes (id_pregunta, id_concepte) VALUES (?, ?)";

            for (const conceptId of conceptIds) {
              await queryDatabase(sqlInsertPreguntesConceptes, [id_pregunta, parseInt(conceptId)]);
              insertsPendents--;

              // Si hem insertat totes les relacions, retornem la resposta d'èxit
              if (insertsPendents === 0) {
                res.json({ Status: "Sucess", missatge: "Pregunta actualitzada correctament." });
              }
            }
          }
        } catch (err) {
          console.error("Error en el processament del concepte:", err);
          return res.json({ Status: "Error", error: "Error al processar el concepte" });
        }
      }
    } catch (err) {
      console.error("Error al recuperar o actualitzar la pregunta:", err);
      return res.json({ Status: "Error", error: "Error en el procés d'actualització" });
    }
});

// Funció auxiliar per a realitzar les consultes de la base de dades amb Promeses
const queryDatabase = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};



app.delete('/deleteQuestion', (req,res)=>{

    const id_Pregunta = req.query.idPregunta;


    const sql = 'DELETE FROM preguntes WHERE id_pregunta = ?'

    db.query(sql, [id_Pregunta], (error, result) => {
    
        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
          } else {
            console.log("Eliminat correctament")
            return res.json(result); 
          }
    })


})

//Funció de recuperació dels temes de la assignatura per afegir preguntes
app.get('/recoverTemasAssignatura', (req, res)=>{ 

    const id_assignatura = req.query.Id_Assignatura;

    
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


//Funció de recuperació dels temes amb preguntes acceptades
app.get('/recoverTemasAssignaturaPreguntes', (req, res) => {
    const id_assignatura = req.query.Id_Assignatura;
  
    
    const sql = `
      SELECT t.*
    FROM temes t
    JOIN preguntes p ON t.id_tema = p.id_tema
    WHERE t.id_assignatura = ?
    AND p.estat = 'acceptada'
    GROUP BY t.id_tema
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
  

//Funció de recuperació preguntes per ser avaluades pel professor
app.get('/recoverQuestions', (req, res)=>{ 

    const id_assignatura = req.query.Id_Assignatura;
    parseInt(id_assignatura);
    
    const sql = `SELECT 
                    preguntes.*, 
                    temes.nom_tema, 
                GROUP_CONCAT(DISTINCT conceptes.nom_concepte ORDER BY conceptes.nom_concepte ASC) AS conceptes
                FROM preguntes
                JOIN temes ON preguntes.id_tema = temes.id_tema
                LEFT JOIN preguntes_conceptes ON preguntes_conceptes.id_pregunta = preguntes.id_pregunta
                LEFT JOIN conceptes ON conceptes.id_concepte = preguntes_conceptes.id_concepte
                WHERE temes.id_assignatura = ?
                GROUP BY preguntes.id_pregunta, temes.nom_tema;
`;

    db.query(sql,[id_assignatura], (error, result)=>{

        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
          } else {
            return res.json(result); 
          }
    })
})


app.get('/recoverQuestionsAlumni', (req, res)=>{ 

    const id_assignatura = req.query.Id_Assignatura;
    const id_user = req.query.Id_User;


    const sql = `SELECT p.*, temes.nom_tema
        FROM preguntes p
        JOIN temes ON p.id_tema = temes.id_tema
        WHERE p.id_creador = ? 
        AND temes.id_assignatura = ? 
        AND p.estat = 'pendent';
    `

    db.query(sql,[id_user, id_assignatura], (error, result)=>{

        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
          } else {
            return res.json(result); 
          }
    })


})


//Funció d'actualització d'estat de les preguntes a la taula preguntes de la base de dades NO TOCAR
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
app.get('/recoverAtendees', (req, res) => {
    const id_assignatura = parseInt(req.query.Id_Assignatura);

    const sql = `
        SELECT usuaris.niu, 
               usuaris.username, 
               usuaris.email, 
               'alumne' AS role, 
               AVG(resultats.nota) AS notes
        FROM usuaris 
        JOIN alumnes_assignatures ON usuaris.niu = alumnes_assignatures.id_alumne 
        LEFT JOIN resultats ON usuaris.niu = resultats.id_alumne AND resultats.id_assignatura = ?
        WHERE alumnes_assignatures.id_assignatura = ?
        GROUP BY usuaris.niu
    `;

    db.query(sql, [id_assignatura, id_assignatura], (error, result) => {
        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed" });
        }
        res.json(result);
    });
});


/*
//Funció de recuperació i normalització de les notes
app.get('/recoverGrades', (req, res) => {
    const id_assignatura = parseInt(req.query.Id_Assignatura);
    const users = req.query.users;

    const getGradesForUser = (userId, assignaturaId) => {
        return db.query('SELECT notes FROM resultats WHERE id_alumne = ? AND id_assignatura = ?', [userId, assignaturaId])
            .then(results => {
                let totalGrade = 0;
                results.forEach(result => {
                    totalGrade += result.grade;
                });
                const averageGrade = (totalGrade / results.length) * 10;
                return (averageGrade / 10) * 100;
            });
    };

    const gradesPromises = users.map(userId => {
        return getGradesForUser(userId, id_assignatura)
            .then(grade => ({
                userId,
                grade
            }))
            .catch(error => {
                return {
                    userId,
                    grade: null
                };
            });
    });

    Promise.all(gradesPromises)
        .then(grades => {
            res.json(grades);
        })
        .catch(err => {
            res.send('Error al recuperar les notes.');
        });
});
*/


/*REPASSAR AQUÍ PERQUE NO FUNCIONA*/ 
app.get("/checkUserExists", async (req, res) => {
    const id_niu = parseInt(req.query.niu, 10); 

    if (isNaN(id_niu)) {
        return res.json({ exists: false, error: "Invalid NIU format" });
    }

    const sql = 'SELECT role FROM usuaris WHERE niu = ?';

    db.query(sql, [id_niu], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ exists: false, error: "Database query failed" });
        }

        if (result.length > 0) {
            const role = result[0].role; 
            return res.json({ exists: true, role }); 
        } else {
            return res.json({ exists: false });
        }
    });
});



app.get("/checkProfessorInSubject", (req, res) => {
    const { niu, Id_Assignatura } = req.query;

    const sql =
        "SELECT COUNT(*) AS count FROM professors_assignatures WHERE id_professor = ? AND id_assignatura = ?";
    db.query(sql, [niu, Id_Assignatura], (error, result) => {
        if (error) {
            console.error("Error en la consulta:", error);
            return res.status(500).json({ exists: false, error: "Database query failed" });
        }
        const exists = result[0].count > 0;
        res.json({ exists });
    });
});

app.get("/checkStudentInSubject", (req, res) => {
    const { niu, Id_Assignatura } = req.query;

    const sql =
        "SELECT COUNT(*) AS count FROM alumnes_assignatures WHERE id_alumne = ? AND id_assignatura = ?";


    db.query(sql, [niu, Id_Assignatura], (error, result) => {
        if (error) {
            console.error("Error en la consulta:", error);
            return res.status(500).json({ exists: false, error: "Database query failed" });
        }
        const exists = result[0].count > 0;
        res.json({ exists });
    });
});



app.post("/addProfessorToSubject", async (req, res) => {
    const { niu, Id_Assignatura } = req.body;

    const sql = 'INSERT INTO professors_assignatures (id_professor, id_assignatura) VALUES (?, ?)';
    db.query(sql, [niu, Id_Assignatura], (error, result) => {
        if (error) {
            console.error("Error al afegir el professor:", error);
            return res.json({ success: false });
        }
        else{
            const sqlSelect = `SELECT usuaris.*, 'alumne' AS role 
            FROM usuaris 
            JOIN alumnes_assignatures ON usuaris.niu = alumnes_assignatures.id_alumne 
            WHERE alumnes_assignatures.id_assignatura = ? `;

            db.query(sqlSelect, [Id_Assignatura], (error, resultSelect) => {

            if(error){
                return res.json({ success: false})
            }

        return res.json({ success: true, resultSelect});
        })
        }
       
    });
});



app.post("/addStudentToSubject", async (req, res) => {
    const { niu, Id_Assignatura } = req.body;

    const sql = 'INSERT INTO alumnes_assignatures (id_alumne, id_assignatura) VALUES (?, ?)';
    db.query(sql, [niu, Id_Assignatura], (error, result) => {
        if (error) {
            console.error("Error al afegir l'alumne:", error);
            return res.json({ success: false});
        }
        else{

            const sqlSelect = `SELECT usuaris.*, 'alumne' AS role 
                        FROM usuaris 
                        JOIN alumnes_assignatures ON usuaris.niu = alumnes_assignatures.id_alumne 
                        WHERE alumnes_assignatures.id_assignatura = ? `;

            db.query(sqlSelect, [Id_Assignatura], (error, resultSelect) => {

                if(error){
                    return res.json({ success: false})
                }

                return res.json({ success: true, resultSelect});
            })


        }
       
    });
});


app.delete('/deleteUser', (req, res) =>{

    const id_user = req.query.values.niu;
    
    const deleteSql = 'DELETE FROM usuaris WHERE niu = ?';

    db.query(deleteSql, [id_user], (error, result) => {
        if (error) {
            console.error("Error al eliminar a l'alumne:", error);
            return res.json({ success: false });
        }

        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None' });
        return res.json({ success: true });
    });

 

})



app.delete('/leaveSubject', (req,res) =>{

    const id_participant = req.query.id;
    const id_assignatura = parseInt(req.query.Id_Assignatura);
    const role = req.query.role_User;
    let deleteSql;

    console.log(id_assignatura, id_participant, role)

    if(role === 'alumne'){
         deleteSql = `DELETE FROM alumnes_assignatures WHERE id_alumne = ? AND id_assignatura = ?`;

        
    }else if(role === 'professor'){
         deleteSql = `DELETE FROM professors_assignatures WHERE id_professor = ? AND id_assignatura = ?`;
    }

    db.query(deleteSql, [id_participant, id_assignatura], (deleteError) => {
        if (deleteError) {
            console.error("Error a la consulta:", deleteError);
            return res.json({ Status: "Failed" });
        }else{
            return res.json({ Status: "Success" });
        }

    });

})



app.delete('/eliminateStudent', (req, res) => {
    const id_participant = req.query.id;
    const id_assignatura = req.query.Id_Assignatura;

    const deleteSql = `DELETE FROM alumnes_assignatures WHERE id_alumne = ? AND id_assignatura = ?`;
    const fetchSql = `SELECT u.niu, u.username, u.email, u.role FROM alumnes_assignatures aa JOIN usuaris u ON aa.id_alumne = u.niu WHERE aa.id_assignatura = ?`;

    db.query(deleteSql, [id_participant, id_assignatura], (deleteError) => {
        if (deleteError) {
            console.error("Error a la consulta:", deleteError);
            return res.json({ Status: "Failed" });
        }
        db.query(fetchSql, [id_assignatura], (fetchError, updatedUsers) => {
            if (fetchError) {
                console.error("Error al recuperar els usuaris:", fetchError);
                return res.json({ Status: "Failed" });
            }
            return res.json(updatedUsers);
        });
    });
});

app.delete('/eliminateTeacher', (req, res) => {
    const id_participant = req.query.id;
    const id_assignatura = req.query.Id_Assignatura;

    const deleteSql = `DELETE FROM professors_assignatures WHERE id_professor = ? AND id_assignatura = ? `;
    const fetchSql = `SELECT * FROM professors_assignatures`;

    db.query(deleteSql, [id_participant, id_assignatura], (deleteError) => {
        if (deleteError) {
            console.error("Error a la consulta:", deleteError);
            return res.json({ Status: "Failed" });
        }
        db.query(fetchSql, (fetchError, updatedUsers) => {
            if (fetchError) {
                console.error("Error al recuperar els usuaris:", fetchError);
                return res.json({ Status: "Failed" });
            }
            return res.json(updatedUsers);
        });
    });
});

app.get('/recuperarPreguntesPerConceptes', (req, res) => {
    const { conceptesSeleccionats } = req.query; 
  
    const conceptesIds = conceptesSeleccionats.map(id => parseInt(id, 10));
  
    const query = `
      SELECT p.*
      FROM preguntes p
      INNER JOIN preguntes_conceptes cp ON p.id_pregunta = cp.id_pregunta
      WHERE cp.id_concepte IN (?)`;
  

    db.query(query, [conceptesIds], (err, results) => {
      if (err) {
        console.error("Error en recuperar les preguntes:", err);
        return res.send("Error en recuperar les preguntes.");
      }
      res.json({ Preguntes: results });
    });
  });



//Funció de recuperació dels temes de la assignatura i conceptes per poder crear tests
app.get('/recoverElementsTest', (req, res) => {
    const id_assignatura = req.query.idAssignatura;
    
    const idAssignatura = parseInt(id_assignatura, 10);

    const sql = `
       SELECT 
    conceptes.id_concepte, 
    conceptes.nom_concepte
FROM 
    temes
INNER JOIN 
    conceptes_temes ON temes.id_tema = conceptes_temes.id_tema
INNER JOIN 
    conceptes ON conceptes_temes.id_concepte = conceptes.id_concepte
INNER JOIN 
    preguntes_conceptes ON conceptes.id_concepte = preguntes_conceptes.id_concepte
INNER JOIN 
    preguntes ON preguntes_conceptes.id_pregunta = preguntes.id_pregunta
WHERE 
    temes.id_assignatura = ? AND
    preguntes.estat = 'acceptada'
GROUP BY 
    conceptes.id_concepte, 
    conceptes.nom_concepte
ORDER BY 
    conceptes.nom_concepte;

    `;

    // Ejecutar la consulta en la base de datos
    db.query(sql, [idAssignatura], (error, result) => {
        if (error) {
            console.error("Error en la consulta:", error);
            return res.json({ Status: "Failed", error: "Error en la consulta de la base de datos" });
        }

        
        const conceptes = result.map(row => ({
            value: row.id_concepte, 
            label: row.nom_concepte 
        }));

      
        res.json(conceptes);
    });
});




//Funció de creació de test professors
app.post('/generarTest', (req, res) => {
    const { idAssignatura, idTema, idCreador, nombreTest } = req.body;
    const llaveAcceso = Math.random().toString(36).substr(2, 8);
  
    const sqlInsertTest = `
      INSERT INTO tests (nom_test, data_final, clau_acces, id_creador, id_assignatura, id_tema)
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
  


//Funció de recuperació de les preguntes segons els paràmetres definits per l'usuari
app.get('/recoverRandomTestQuestions', async (req, res) => { 
   

    const temes = req.query.temes;
    const conceptes = req.query.conceptes;

   // console.log(temes, conceptes)

    const sql = `SELECT * FROM preguntes WHERE (tema_id IN (:temes) OR :temes IS NULL) AND (concepte_id IN (:conceptes) OR :conceptes IS NULL);`

    db.query(sql, (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ status: "Failed", error });
        }
        res.json({ status: "Success", Preguntes: result });
    });


});


//Funció de recuperació de les preguntes dels tests (utilitzats en tests avaluatius)

app.get('/recoverSelectedTestWithKeyQuestions', (req, res) => {

    const idTest = parseInt(req.query.idTest);
    
    const sql = `
            SELECT 
                p.id_pregunta, 
                p.pregunta, 
                p.solucio_correcta, 
                p.solucio_erronia1, 
                p.solucio_erronia2, 
                p.solucio_erronia3, 
                pt.posicio_test, 
                p.id_tema, 
                t.tipus,
                t.id_assignatura,  
                t.nom_test,
                t.data_final,
                t.temps,
                t.clau_acces,
                GROUP_CONCAT(c.nom_concepte ORDER BY c.nom_concepte SEPARATOR ', ') AS conceptes
            FROM 
                test_preguntes pt
            JOIN 
                preguntes p ON pt.id_pregunta = p.id_pregunta
            JOIN 
                tests t ON pt.id_test = t.id_test
            LEFT JOIN 
                preguntes_conceptes pc ON p.id_pregunta = pc.id_pregunta
            LEFT JOIN 
                conceptes c ON pc.id_concepte = c.id_concepte
            WHERE 
                pt.id_test = ?
            GROUP BY
                p.id_pregunta, 
                p.pregunta, 
                p.solucio_correcta, 
                p.solucio_erronia1, 
                p.solucio_erronia2, 
                p.solucio_erronia3, 
                pt.posicio_test, 
                p.id_tema, 
                t.tipus,
                t.id_assignatura,  
                t.nom_test,
                t.data_final,
                t.temps,
                t.clau_acces
            ORDER BY 
                pt.posicio_test;

            `;
    db.query(sql, [idTest], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ status: "Failed", error });
        }
        res.json({ status: "Success", Preguntes: result });
    });

});

//Funció 
app.post('/saveResults', (req, res) =>{

    const id_Test = parseInt(req.body.idTest);
    const grade = parseFloat(req.body.nota);
    const id_User = req.body.Id_User;
    const id_Subject = parseInt(req.body.Id_Subject);

    //console.log(id_User, id_Test, grade)

    const sql = `INSERT INTO resultats (id_alumne, id_test, nota, id_assignatura) VALUES (?,?,?, ?)`;

    db.query(sql, [id_User, id_Test, grade, id_Subject], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ status: "Failed", error });
        }
        res.json({  Status: "Sucess" });
    });

})

//Funció actualització del test

app.put('/updateTestCustom', (req, res) =>{


    const {testName, data, minutes, tipus, clauAux, idTest} = req.body;

    const sql = 'UPDATE tests SET nom_test = ?, data_final = ?, temps = ?, tipus = ?, clau_acces = ? WHERE id_test = ? ';



    db.query(sql, [testName, data, minutes, tipus, clauAux, idTest], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ status: "Failed", error });
        }
        return res.json({  Status: "Sucess" });
    });

})


//Funció de recuperació de totes les preguntes
app.get('/recoverPreguntes', (req, res) => {

    const id_assignatura = req.query.idAssignatura;


    const sql = `SELECT 
    p.id_pregunta, 
    p.pregunta,
    p.solucio_correcta,
    p.dificultat,
    t.nom_tema, 
    GROUP_CONCAT(c.nom_concepte SEPARATOR ', ') AS conceptes
    FROM 
        preguntes p
    JOIN 
        temes t ON p.id_tema = t.id_tema
    LEFT JOIN 
        preguntes_conceptes pc ON p.id_pregunta = pc.id_pregunta
    LEFT JOIN 
        conceptes c ON pc.id_concepte = c.id_concepte
    WHERE 
        t.id_assignatura = ?
    GROUP BY     
        p.id_pregunta, p.pregunta, t.nom_tema`;

    db.query(sql, [id_assignatura], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ Status: "Failed" });
        } else {
           
            return res.json(result);
        }
    });
});

//Funció de recuperació de les preguntes segons el tema
app.get('/recoverPreguntesTema', (req, res) => {
    const idAssignatura = req.query.idAssignatura;
    

    if (!idAssignatura) {
        console.error("ID Assignatura no proporcionat");
        return res.json({ error: "ID Assignatura es requerit" });
    }

    const sql = `
        SELECT preguntes.*, temes.nom_tema 
        FROM preguntes 
        JOIN temes ON preguntes.id_tema = temes.id_tema 
        WHERE temes.id_assignatura = ?  
    `;
    db.query(sql, [idAssignatura], (error, result) => {
        if (error) {
            console.error("Error a la consulta:", error);
            return res.json({ error: "Error a la consulta." });
        }
        //console.log("Preguntes retornades:", result);
        return res.json(result);
    });
});


//Funció creació de test manual pel professor

app.post('/createTest', async (req, res) => {
    const { nom_test, id_creador, id_assignatura, idTema, tipus, data_finalitzacio, duracio } = req.body;

    // Validar data finalització
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Formato YYYY-MM-DD
    if (!data_finalitzacio || !dateRegex.test(data_finalitzacio)) {
        return res.json({ Status: "Failed", Message: "Data finalització no vàlida. Utilitza el format YYYY-MM-DD." });
    }


    const clau_acces = null;
    if (tipus === 'avaluatiu') {
        clau_acces = Math.random().toString(36).substr(2, 8);
    }
 
    

    const idCreador = parseInt(id_creador, 10);
    const idAssignatura = parseInt(id_assignatura, 10);
    const idTemaParsed = parseInt(idTema, 10);

    const sql = `
        INSERT INTO tests 
        (nom_test,  data_final, clau_acces, id_creador, id_assignatura, id_tema, tipus, temps) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [nom_test, data_finalitzacio, clau_acces, idCreador, idAssignatura, idTemaParsed, tipus, duracio],
        (error, result) => {
            if (error) {
                console.error("Error en la consulta:", error);
                return res.json({ Status: "Failed", message:"Error al insertar" });
            } else {
                return res.json({ success: true, id_test: result.insertId });
            }
        }
    );
});


//Funció creació test automàtic
app.post('/createQuizz', (req, res) => {
    const { seleccions, nom_test, id_creador, id_assignatura, id_tema, tipus, data_finalitzacio, durationNormal } = req.body;

    // Validar la data de finalització
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format YYYY-MM-DD
    if (!data_finalitzacio || !dateRegex.test(data_finalitzacio)) {
        return res.json({ Status: "Failed", Message: "Data finalització no vàlida. Utilitza el format YYYY-MM-DD." });
    }

    
    const idCreador = parseInt(id_creador, 10);
    const idAssignatura = parseInt(id_assignatura, 10);
    const duration = parseInt(durationNormal);
    let clau_acces = null;

    const sqlInsertTestBase = `
        INSERT INTO tests 
        (nom_test, data_final, clau_acces, id_creador, id_assignatura, id_tema, tipus, temps) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

   
    if (tipus === 'avaluatiu') {
        clau_acces = Math.random().toString(36).substr(2, 8);
    }

    db.query(sqlInsertTestBase, [nom_test, data_finalitzacio, clau_acces, idCreador, idAssignatura, id_tema, tipus, duration], (error, result) => {
        if (error) {
            console.error("Error al crear el test:", error);
            return res.json({ Status: "Error al crear el test" });
        }

        const idTest = result.insertId;

        // Generar preguntes per cada tema seleccionat
        const queries = seleccions.map(({ id, preguntes }) => {
            return new Promise((resolve, reject) => {
                const sqlGetQuestions = `
                    SELECT id_pregunta 
                    FROM preguntes
                    WHERE id_tema = ? 
                    ORDER BY RAND() LIMIT ?
                `;

                db.query(sqlGetQuestions, [id, preguntes], (error, questions) => {
                    if (error) {
                        console.error("Error al obtenir preguntes:", error);
                        return reject(error);
                    }
                    resolve(questions.map(q => [idTest, q.id_pregunta]));
                });
            });
        });

        Promise.all(queries)
            .then(allQuestions => {
                const sqlInsertTestQuestions = `
                    INSERT INTO test_preguntes (id_test, id_pregunta) VALUES ?
                `;

                const allQuestionsFlattened = allQuestions.flat();

                db.query(sqlInsertTestQuestions, [allQuestionsFlattened], (error) => {
                    if (error) {
                        console.error("Error al associar preguntes al test:", error);
                        return res.json({ Status: "Error al processar les preguntes" });
                    }

                    res.json({
                        Status: "Test creat correctament",
                        clau_acces,
                        id_test: idTest,
                    });
                });
            })
            .catch(error => {
                console.error("Error al processar les preguntes:", error);
                res.json({ Status: "Error al processar preguntes" });
            });
    });
});




app.post('/insertQuestionsTest', (req, res) => {

    const idTest = req.body.id_test;
    parseInt(idTest);
    const preguntesTest = req.body.questions;

    
    const sql = 'INSERT INTO test_preguntes (id_test, id_pregunta, posicio_test) VALUES (?, ?, ?)';

    const values = preguntesTest.map((pregunta) => [idTest, pregunta.id_pregunta, pregunta.posicio]);
    const promises = values.map((value) => {
        return new Promise((resolve, reject) => {
            db.query(sql, value, (error, result) => {
                if (error) {
                    console.error("Error al insertar la pregunta:", value, error);
                    return reject(error);
                }
                resolve(result);
            });
        });
    });


    Promise.all(promises)
        .then((results) => {
            return res.json({ status: "Success", results });
        })
        .catch((error) => {
            console.error("Error durante el proceso de inserción:", error);
            return res.json({ status: "Failed", message: "Database error" });
        });
    
});


//Funció de recuperació dels tests del tema
app.get('/recoverTestsTema', (req, res) =>{


const idTema = req.query.id_tema;

parseInt(idTema, 10);
const sql = 'SELECT id_test, nom_test, tipus FROM tests WHERE id_tema = ?'

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


//Funció per guardar els canvis efectuats dins un test avaluatiu, ja sigui posició, eliminació o afegir preguntes
app.post("/updateTestQuestions", (req, res) => {
    const { idTest, questions } = req.body;
  
    if (!idTest || !questions) {
      return res.send("Dades incompletes: idTest o questions no rebut.");
    }
  
    const deleteQuery = "DELETE FROM test_preguntes WHERE id_test = ?";

    db.query(deleteQuery, [idTest], (err, result) => {
      if (err) {
        console.error("Error eliminant preguntes anteriors:", err);
        return res.send("Error eliminant les preguntes actuals.");
      }
  
      const insertQuery = `INSERT INTO test_preguntes (id_test, id_pregunta, posicio_test) VALUES (?, ?, ?)`;
  
      const insertPromises = questions.map((question) => {
        return new Promise((resolve, reject) => {
          db.query(
            insertQuery,
            [idTest, question.id_pregunta, question.posicio],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
      });
  
      Promise.all(insertPromises)
        .then(() => {
          res.send("Les preguntes del test s'han actualitzat correctament.");
        })
        .catch((err) => {
          console.error("Error inserint les noves preguntes:", err);
          res.send("Error actualitzant les preguntes del test.");
        });
    });
  });


app.delete("/deleteTest", (req, res) =>{


    const id_test = req.query.idTest;

    const sql = "DELETE FROM tests WHERE id_test = ?";

    db.query(sql, [id_test], (err, result) => {
        if (err) {
            console.error("Error eliminant test:", err);
            return res.json({ status: "Error", message: "Error del servidor" });
        }

        if (result.length > 0) {
            return res.json(result);
        } else {
            return res.json({ status: "Error" });
        }
    });


  })


//Funció de recuperació de 10 preguntes per test amb probabilitats.
app.get("/recoverPreguntaRandom", (req, res) => {

    const id_tema = parseInt(req.query.temaSeleccionat);

    if (!id_tema) {
        return res.json({ status: "Error", message: "Id de tema no vàlid" });
    }

    //console.log("Recuperant pregunta per al tema:", id_tema);

    const sql = 'SELECT * FROM preguntes WHERE id_tema = ? ORDER BY RAND() LIMIT 1';

    db.query(sql, [id_tema], (err, result) => {
        if (err) {
            console.error("Error obtenint pregunta:", err);
            return res.json({ status: "Error", message: "Error del servidor" });
        }

        if (result.length > 0) {
            return res.json(result);
        } else {
            return res.json({ status: "Error", message: "No s'ha trobat cap pregunta" });
        }
    });
});



app.post("/import-csv", upload.single("file"), async (req, res) => {
    const filePath = req.file.path;
    const results = [];
    const errors = [];
    const newUsers = [];
    const niusInFile = new Set(); // Per evitar NIUs duplicats al fitxer

    try {
        // Llegim el fitxer CSV
        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: ";", quote: '"' }))
            .on("data", (row) => results.push(row))
            .on("end", async () => {
                fs.unlinkSync(filePath); // Eliminem el fitxer temporal

                try {
                    const promises = [];
                    const subjectId = parseInt(req.body.Id_Assignatura, 10); // ID de l'assignatura

                    for (const { NIU, username, email, password, role } of results) {
                        // Validacions de camps
                        if (!NIU || !username || !email || !password || !role) {
                            errors.push(`Fila amb NIU ${NIU || "desconegut"}: Camps incomplets.`);
                            continue;
                        }
                        if (!/^\d{7}$/.test(NIU)) {
                            errors.push(`Fila amb NIU ${NIU}: El NIU ha de ser un número de 7 dígits.`);
                            continue;
                        }
                        if (niusInFile.has(NIU)) {
                            errors.push(`Fila amb NIU ${NIU}: Duplicat al fitxer.`);
                            continue;
                        }
                        if (!/^[^\s@]+@[^\s@]+\.com$/.test(email)) {
                            errors.push(`Fila amb NIU ${NIU}: L'email no té un format vàlid.`);
                            continue;
                        }
                        if (role !== "alumne" && role !== "professor") {
                            errors.push(`Fila amb NIU ${NIU}: El rol ha de ser 'alumne' o 'professor'.`);
                            continue;
                        }
                        niusInFile.add(NIU);

                        // Comprovar si l'usuari ja existeix
                        const userExists = await new Promise((resolve, reject) => {
                            db.query("SELECT * FROM usuaris WHERE niu = ?", [NIU], (err, result) => {
                                if (err) reject(err);
                                else resolve(result.length > 0);
                            });
                        });

                        if (!userExists) {
                            // Inserir nou usuari
                            const hashedPassword = await bcrypt.hash(password, saltRounds);
                            promises.push(
                                new Promise((resolve, reject) => {
                                    db.query(
                                        "INSERT IGNORE INTO usuaris (niu, username, password, role, email) VALUES (?, ?, ?, ?, ?)",
                                        [NIU, username, hashedPassword, role, email],
                                        (err) => (err ? reject(err) : resolve())
                                    );
                                })
                            );
                            newUsers.push({ NIU, username, email, role });
                        }

                        // Vincular usuari amb assignatura
                        if (role === "alumne") {
                            promises.push(
                                new Promise((resolve, reject) => {
                                    db.query(
                                        "INSERT IGNORE INTO alumnes_assignatures (id_alumne, id_assignatura) VALUES (?, ?)",
                                        [NIU, subjectId],
                                        (err) => (err ? reject(err) : resolve())
                                    );
                                })
                            );
                        } else if (role === "professor") {
                            promises.push(
                                new Promise((resolve, reject) => {
                                    db.query(
                                        "INSERT IGNORE INTO professors_assignatures (id_professor, id_assignatura) VALUES (?, ?)",
                                        [NIU, subjectId],
                                        (err) => (err ? reject(err) : resolve())
                                    );
                                })
                            );
                        }
                    }

                    // Esperem que totes les promeses es compleixin
                    await Promise.all(promises);

                    // Resposta final amb usuaris 

                    db.query(
                        `SELECT usuaris.*, 'alumne' AS role 
                         FROM usuaris 
                         JOIN alumnes_assignatures 
                         ON usuaris.niu = alumnes_assignatures.id_alumne 
                         WHERE alumnes_assignatures.id_assignatura = ?`,
                        [subjectId],
                        (err, result) => {
                            if (err) {
                                console.error("Error en la consulta SELECT:", err);
                                return res.status(500).json({ 
                                    status: "error", 
                                    message: "Error al recuperar els usuaris.", 
                                    error: err 
                                });
                            }
                    
                            // Resposta final
                            res.json({
                                status: "success",
                                message: "Importació completada.",
                                newUsers, 
                                errors, 
                                participants: result 
                            });
                        }
                    );

                    
                } catch (err) {
                    console.error("Error processant el fitxer:", err);
                    res.json({ status: "error", message: "Error del servidor." });
                }
            });
    } catch (err) {
        console.error("Error llegint el fitxer:", err);
        res.json({ status: "error", message: "Error processant el fitxer." });
    }
});

  
  
  

//Funció d'escolta del servidor 
app.listen(8081, () => {
    console.log("Running Server...");
});




