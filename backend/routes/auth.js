const router = require("express").Router();
const mysqlConfig = require("../config.js");

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
router.use(cookieParser());


// ユーザーを登録するエンドポイント
router.post("/register", [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }), // パスワードの最小長を指定
    body("name").isLength({ min: 2, max: 10 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const id = req.body.id

    // パスワードをハッシュ化
    bcrypt.hash(password, 10, (hashError, hashedPassword) => {
        if (hashError) {
            console.error('Error hashing password:', hashError);
            return res.status(500).json({ error: 'Error hashing password.' });
        }

        mysqlConfig.getConnection((connectionError, connection) => {
            if (connectionError) {
                console.error('MySQL connection error: ' + connectionError.stack);
                return res.status(500).json({ error: 'MySQL connection error.' });
            }

            connection.query('SELECT * FROM users WHERE email = ?', [email], (queryError, selectResults) => {
                if (queryError) {
                    console.error('Error querying database: ' + queryError.stack);
                    connection.release(); // コネクションの解放
                    return res.status(500).json({ error: 'Error querying database.' });
                }

                if (selectResults.length > 0) {
                    connection.release(); // コネクションの解放
                    return res.status(400).json({
                        message: "すでにそのメールアドレスは登録されています。"
                    });
                }

                // ユーザーをデータベースに挿入
                connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], async (insertError, insertResults) => {
                    connection.release(); // コネクションの解放
                    if (insertError) {
                        console.error('Error inserting user into database: ' + insertError.stack);
                        return res.status(500).json({ error: 'Error inserting user into database.' });
                    }
                    //jwtトークンの発行
                    const token =  JWT.sign({
                        email,
                        name,
                        id
                        
                        
                        
                    },
                    "SECRET_KEY",
                    {
                        expiresIn: "24h",
                    }
                    )
                    //あとで設定

                    // httpOnly: true,

                    // Cookieにトークンを設定
                    res.cookie("token", token, {  maxAge: 86400000 }); // 有効期限: 24時間
                    return res.json({
                        token,
                        message: "ユーザーが正常に登録されました。"
                    });
                });
            });
        });
    });
});

// ユーザーをログインするエンドポイント
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    mysqlConfig.getConnection((connectionError, connection) => {
        if (connectionError) {
            console.error('MySQL connection error: ' + connectionError.stack);
            return res.status(500).json({ error: 'MySQL connection error.' });
        }

        connection.query('SELECT * FROM users WHERE email = ?', [email], async (queryError, selectResults) => {
            if (queryError) {
                console.error('Error querying database: ' + queryError.stack);
                connection.release(); // コネクションの解放
                return res.status(500).json({ error: 'Error querying database.' });
            }

            if (selectResults.length === 0) {
                return res.status(400).json({
                    message: "そのユーザーは存在しません"
                });
            }

            const user = selectResults[0];

            // パスワードの検証
            const isMatchPassword = await bcrypt.compare(password, user.password);

            if (!isMatchPassword) {
                return res.status(400).json({
                    message: "パスワードが間違っています"
                });
            }

            // ログイン成功時の処理
            // ここで JWT トークンを生成して返すなどの処理を行う

            // JWT トークンの生成
        // JWT トークンの生成
            const token = JWT.sign({
                email: user.email,
                id: user.id,
                name: user.name
            }, "SECRET_KEY", {
                expiresIn: "24h"
            });
                    
            // Cookieにトークンを設定
            res.cookie("token", token, {  maxAge: 86400000 }); // 有効期限: 24時間
            res.status(200).json({
                
                token,
                message: "ログインに成功しました",
                id: user.id,
                name: user.name,
                email: user.email,
            });

            connection.release(); // コネクションの解放
        });
    });
});


/// ログイン状態を認証するエンドポイント
router.get("/authenticate", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "認証されていません" });
    }

    try {
        // トークンの検証
        const decoded = JWT.verify(token, "SECRET_KEY");
        // トークンが正常であれば、そのトークンに含まれるユーザーIDを取得して返す
        return res.status(200).json({
            email: decoded.email,
            name: decoded.name,
            id: decoded.id
        });
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "認証に失敗しました" });
    }
});






// すべてのユーザーを取得するエンドポイント
router.get('/users', (req, res) => {

    mysqlConfig.getConnection((connectionError, connection) => {
        if (connectionError) {
            console.error('MySQL connection error: ' + connectionError.stack);
            return res.status(500).json({ error: 'MySQL connection error.' });
        }
        
        connection.query(`SELECT id,name,email FROM users  `, (error, selectResults) => {
            
            connection.release(); // コネクションの解放
            if (error) {
                console.error('Error fetching users:', error);
                res.status(500).json({ error: 'Error fetching users.' });
            } else {
                res.json(selectResults); // SELECTクエリの結果をJSON形式で返す
            }
        });
    });
});
// router.get('/:id', (req, res) => {
//     // リクエストヘッダーからトークンを取得
//     // const token = req.cookies.token;
//     const userId = req.params.id
// // データベースからユーザー情報を取得
//         mysqlConfig.getConnection((connectionError, connection) => {
//             if (connectionError) {
//                 console.error('MySQL connection error: ' + connectionError.stack);
//                 return res.status(500).json({ error: 'MySQL connection error.' });
//             }

//             connection.query('SELECT id, name, email FROM users WHERE id = ?', [userId], (queryError, selectResults) => {
//                 connection.release(); // コネクションの解放
//                 if (queryError) {
//                     console.error('Error querying database: ' + queryError.stack);
//                     return res.status(500).json({ error: 'Error querying database.' });
//                 }

//                 if (selectResults.length === 0) {
//                     return res.status(404).json({ message: 'ユーザーが見つかりませんでした' });
//                 }

//                 // ユーザー情報を返す
//                 const user = selectResults[0];
//                 return res.json(user);
//             });
//         });

//     })

router.get('/:id', (req, res) => {
    const token = req.cookies.token;
    const requestedUserId = parseInt(req.params.id);

    if (!token) {
        return res.status(401).json({ message: "認証されていません" });
    }

    try {
        JWT.verify(token, "SECRET_KEY", (err, decoded) => {
            if (err) {
                console.error("Token verification error:", err);
                return res.status(401).json({ message: "認証に失敗しました" });
            }

            const authenticatedUserId = decoded.id;

            // リクエストされたIDと認証されたユーザーのIDが一致するか確認
            if (requestedUserId !== authenticatedUserId) {
                return res.status(403).json({ message: "アクセス権がありません" });
            }

            // ユーザーのデータベースからの取得処理を行う
            mysqlConfig.getConnection((connectionError, connection) => {
                if (connectionError) {
                    console.error('MySQL connection error: ' + connectionError.stack);
                    return res.status(500).json({ error: 'MySQL connection error.' });
                }

                connection.query('SELECT id, name, email FROM users WHERE id = ?', [requestedUserId], (queryError, selectResults) => {
                    connection.release(); // コネクションの解放
                    if (queryError) {
                        console.error('Error querying database: ' + queryError.stack);
                        return res.status(500).json({ error: 'Error querying database.' });
                    }

                    if (selectResults.length === 0) {
                        return res.status(404).json({ message: 'ユーザーが見つかりませんでした' });
                    }

                    // ユーザー情報を返す
                    const user = selectResults[0];
                    return res.json(user);
                });
            });
        });
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "認証に失敗しました" });
    }
});

// ユーザーをログアウトするエンドポイント
router.post("/logout", (req, res) => {
    // Cookieからトークンを削除する
    res.clearCookie("token");
    // ログアウト成功のレスポンスを返す
    res.status(200).json({ message: "ログアウトしました" });
});
    
module.exports = router;
