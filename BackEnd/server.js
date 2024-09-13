import express from "express";
import mysql, { createConnection } from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";


const app = express ();
app.use(express.json());
app.use(cors());
app.use(cookieParser);


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ga21012002",
    database: "web_examen",
})


app.post('/register', (req, res) => {

const SQL = "INSERT INTO users (`username`, `password`, `role`,`email`) VALUES";

const values = [
    req.body.name,
    req.body.password,
    req.body.role,
    req.body.email,
]

db.query(SQL, [values], (err, result) => {

    if(err) return res.json({Error: "Inserting data Error"});
    return res.json({Status: "Succeded"});
})

})

app.listen(8081, () => {
    console.log("Running Server...");
})