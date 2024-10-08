import express from "express";
import mysql, { createConnection } from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const salt = 10

const app = express ();
app.use(express.json());
app.use(cors());
app.use(cookieParser());



app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.post('/register', (req, res) => {


    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Ga21012002",
        database: "web_examen"
    });

    const { niu, username, password, role, gmail } = req.body;

    if (!niu || !username || !password || !role || !gmail) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
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
})



app.post('/login', (req, res) => {


    const sql = 'SELECT * from users'
    db.query(sql, [values], (err, result) => {
        if (err) return res.json({ Error: err.message });
        return res.json({ Status: "Succeeded" });
    });
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