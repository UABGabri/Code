import express, { response } from "express";
import mysql, { createConnection } from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const salt = 10

const app = express ();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', //origen específic
    methods: ['GET', 'POST'],         // Metodes permesos
    credentials: true                 // Credencials necessaris
  }));
app.use(cookieParser());



app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.post('/register', (req, res) => { //lloc on rebem trucada post de register amb la informació necessaria


    const db = mysql.createConnection({ //crear connexio amb db.
        host: "localhost",
        user: "root",
        password: "Ga21012002",
        database: "web_examen"
    });

    const { niu, username, password, role, gmail } = req.body; 

    if (!niu || !username || !password || !role || !gmail) {
        return res.status(400).json({ error: "Tots els camps es requereixen" });
    }

    const sql = "INSERT INTO users (niu, username, password, role, gmail) VALUES (?)"; 

    bcrypt.hash(req.body.password.toString(), salt, ( (err, hash) => {

        if(err) return res.json({Error:"Error hashing password"});

        const values = [

            req.body.niu,
            req.body.username,
            hash,
            req.body.role,
            req.body.gmail,
        ]


        db.query(sql, [values], (err, result) => {
            if (err) return res.json({ Error: err.message });
            return res.json({ Status: "Succeeded" });
        });

    }))

    db.end();
})



app.post('/login', (req, res) => {

    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Ga21012002",
        database: "web_examen"
    });

    const sql = 'SELECT * FROM users WHERE niu = ?';

    db.query(sql, [req.body.niu], (err, data) => {
        if (err) {
            return res.status(500).json({ Error: "Error al iniciar sesión" });
        }

        if (data.length > 0) {
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                if (err) {
                    return res.status(500).json({ Error: "Error intern" });
                }
                if (response) {

                    const name = data[0].name; //revisar cookies bien hechas
                    const token = jwt.sign({name}, "jwt-secret-key", {expiresIn: '1d'});

                    res.cookie('token', token);
                    res.json({ Status: "Success" });
                } else {
                    res.status(401).json({ Status: "Contrasenya incorrecta" });
                }
            });
        } else {
            return res.status(404).json({ Error: "NIU no existent" });
        }
    });

    db.end();
})



/*
app.post('/test', (req, res) => {

    const {username} = req.body

    const sqle = "INSERT INTO test (nombre) VALUES (?)";


    const value = [

        req.body.username
    ]

    db.query(sqle, value, (err, result) => {
        if (err) return res.json({ Error: "Inserting data Error" });
        return res.json({ Status: "Succeeded" });
    });


})
*/


app.listen(8081, () => {
    console.log("Running Server...");
})