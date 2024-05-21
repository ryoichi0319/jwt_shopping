const mysql = require("mysql2");

const mysqlConfig = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "password",
    database: "jwt",
    port: 3306
});

module.exports =   mysqlConfig;