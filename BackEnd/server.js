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
    database: "web_examen"
})


app.listen(8081, () => {
    console.log("Running Server...");
})