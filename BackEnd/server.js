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
    methods: ['GET', 'POST'],// Metodes permesos
    credentials: true // Credencials necessaris
}));
app.use(cookieParser());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ga21012002",
    database: "web_examen"
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
        database: "web_examen"
    });

    const { niu, username, password, role, gmail } = req.body; 

    if (!niu || !username || !password || !role || !gmail) {
        return res.status(400).json({ error: "Tots els camps es requereixen" });
    }

    const sql = "INSERT INTO users (niu, username, password, role, gmail) VALUES (?)"; 

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
                    const role = data[0].role;
                    const name = data[0].name;
                    const token = jwt.sign({ name, role }, "jwt-secret-key", { expiresIn: '1d' });

                    res.cookie('session', token, { httpOnly: true, secure: true, sameSite: 'None' });

                    res.json({ Status: "Success" });
                } else {
                    res.status(401).json({ Status: "Contrasenya incorrecta" });
                }
            });
        } else {
            return res.status(404).json({ Error: "NIU no existent" });
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
                req.role = decoded.role;
                next();
            }
        });
    }
};

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", name: req.name, role:req.role});
});

app.listen(8081, () => {
    console.log("Running Server...");
});
