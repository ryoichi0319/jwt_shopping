const router = require("express").Router();
const mysql = require("mysql2")

const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "password",
    database: "jwt",
    port: 3306
});

router.get("/:id", (req, res) => {
    const userId = req.params.id;
    pool.getConnection((err,connection) => {
        if(err){
            console.error("error connecting database",err)
            res.status(500).send("Internal Server Error")
            return
        }
        connection.query("select id,name,email from users where id = ?",[userId],(err,result) => {
            connection.release()

            if (err) {
                console.error("Error querying database:", err);
                res.status(500).send("Internal Server Error");
                return;
            }
            if (result.length === 0) {
                res.status(404).send("User not found");
            } else {
                console.log(result[0])
                res.status(200).json(result[0]);

            }
        })
    })

});

module.exports=router