const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8000;
const auth = require("./routes/auth");
const user = require("./routes/user")
const shop = require("./routes/shop")

app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}))
app.use(express.json());
app.use("/auth", auth);
app.use("/shop", shop);
app.use("/user", user)



// app.get("/", (req, res) => {
//     res.send("hello express");
// });



app.listen(PORT, () => {
    console.log("サーバー起動しました。");
});
