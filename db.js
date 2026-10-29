
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Anusha@07",
    database: "urban_farming"
});

module.exports = db;
