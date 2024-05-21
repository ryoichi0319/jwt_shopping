const router = require("express").Router();
const mysqlConfig = require("../config.js");

const JWT = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
router.use(cookieParser());



router.get('/', (req, res) => {
    mysqlConfig.getConnection((connectionError, connection) => {
        if (connectionError) {
            console.error('MySQL connection error: ' + connectionError.stack);
            return res.status(500).json({ error: 'MySQL connection error.' });
        }

        connection.query(`SELECT shohin_id, shohin_mei, hanbai_tanka, url FROM shohin`, (error, results, fields) => {
            connection.release(); // コネクションの解放

            if (error) {
                console.error('Error retrieving product data:', error);
                return res.status(500).json({ message: 'Internal server error' });
            } else {
                return res.status(200).json(results); // データを返す
            }
        });
    });
});



// / ログイン状態を認証するエンドポイント
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

//認証ミドルウェア
const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "認証されていません" });
    }

    try {
        const decoded = JWT.verify(token, "SECRET_KEY");
        req.user = decoded; // リクエストオブジェクトにデコードされたユーザー情報を保存
        next(); // 次のミドルウェア関数に処理を移譲
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "認証に失敗しました" });
    }
};

//カートに商品を登録
router.post("/:id/cart", authenticateUser, (req, res) => {
    const requestedUserId = parseInt(req.params.id);
    const authenticatedUserId = req.user.id;
    console.log(authenticatedUserId,"id")

    if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "アクセス権がありません" });
    }
    
    const { shohin_id, quantity, hanbai_tanka, shohin_mei, user_id, url } = req.body; // リクエストボディから商品IDと数量を取得
    const checkQuery = `SELECT * FROM cart WHERE shohin_id = ? `;
   
    // カートに商品を追加するSQLクエリを作成
    const addToCartQuery = `
        INSERT INTO cart (shohin_id, quantity, hanbai_tanka, shohin_mei, user_id, url)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    //カートを更新
    const updateCartQuery = `
    UPDATE cart 
    SET quantity = quantity + ?
    WHERE user_id = ? AND shohin_id = ?
`;
    

    // カートに商品を追加
    mysqlConfig.getConnection((connectionError, connection) => {
        if (connectionError) {
            console.error('MySQL connection error: ' + connectionError.stack);
            return res.status(500).json({ error: 'MySQL connection error.' });
        }
        connection.query(checkQuery, [shohin_id], (error, results, fields) => {
            if (error) {
                connection.release(); // エラー時もコネクションを解放する
                console.error('Error checking product in cart:', error);
                return res.status(500).json({ message: 'Internal server error' });
            } 
            if (results.length > 0) {
                // すでにカート内に商品がある場合は数量を更新する
                connection.query(updateCartQuery, [quantity, user_id, shohin_id], (updateError, updateResults, updateFields) => {
                    connection.release(); // コネクションの解放

                    if (updateError) {
                        console.error('Error updating product quantity in cart:', updateError);
                        return res.status(500).json({ message: 'Internal server error' });
                    } 
                    return res.status(200).json({ message: 'Product quantity updated in cart successfully' });
                });
            } else {
                // カートに新しい商品を追加する
                connection.query(addToCartQuery, [shohin_id, quantity, hanbai_tanka, shohin_mei, user_id, url], (addError, addResults, addFields) => {
                    connection.release(); // コネクションの解放

                    if (addError) {
                        console.error('Error adding product to cart:', addError);
                        return res.status(500).json({ message: 'Internal server error' });
                    } 
                    return res.status(200).json({ message: 'Product added to cart successfully' });
                });
            }
        });
    });
});

//カートアイテムの数編集
router.put("/:id/cart", authenticateUser, (req, res) => {
    const requestedUserId = parseInt(req.params.id);
    const authenticatedUserId = req.user.id; 

    if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "アクセス権がありません" });
    }

    const { shohin_id, quantity } = req.body; // リクエストボディから商品IDと数量を取得

    // カートアイテムの数量を更新するSQLクエリを作成
    const updateCartQuery = `
        UPDATE cart 
        SET quantity = ?
        WHERE user_id = ? AND shohin_id = ?
    `;

    // カートアイテムの数量を更新
    mysqlConfig.getConnection((connectionError, connection) => {
        if (connectionError) {
            console.error('MySQL connection error: ' + connectionError.stack);
            return res.status(500).json({ error: 'MySQL connection error.' });
        }

        connection.query(updateCartQuery, [quantity, requestedUserId, shohin_id], (error, results, fields) => {
            connection.release(); // コネクションの解放

            if (error) {
                console.error('Error updating quantity in cart:', error);
                return res.status(500).json({ message: 'Internal server error' });
            } else {
                return res.status(200).json({ message: 'Cart item quantity updated successfully' });
            }
        });
    });
});

//カート商品表示
router.get("/:id/cart", authenticateUser, (req, res) => {
    const requestedUserId = parseInt(req.params.id);
    const authenticatedUserId = req.user.id;

    if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "アクセス権がありません" });
    }

    mysqlConfig.getConnection((connectionError, connection) => {
        if (connectionError) {
            console.error('MySQL connection error: ' + connectionError.stack);
            return res.status(500).json({ error: 'MySQL connection error.' });
        }
        connection.query(
            `SELECT shohin_id, shohin_mei, hanbai_tanka, url, SUM(quantity) as sum_quantity 
            FROM cart 
            WHERE user_id = ? 
            GROUP BY shohin_id, shohin_mei, hanbai_tanka, url;`,
            [requestedUserId],
            (error, results, fields) => {
                connection.release(); // コネクションの解放
                if (error) {
                    console.error('Error retrieving cart data:', error);
                    return res.status(500).json({ message: 'Internal server error' });
                } else {
                    return res.status(200).json(results); // データをJSON形式で返す
                }
            }
        );
    });
});

//カートの商品削除
router.delete("/:id/cart", authenticateUser, (req, res) => {
    const requestedUserId = parseInt(req.params.id);
    const authenticatedUserId = req.user.id; 

    if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "アクセス権がありません" });
    }
    const user_id = requestedUserId; // requestedUserId をそのまま代入する

    const { shohin_id } = req.body; 

    const deleteCartQuery = `DELETE FROM cart WHERE shohin_id = ? AND user_id = ?;`;

    mysqlConfig.getConnection((connectionError, connection) => {
        if (connectionError) {
            console.error('MySQL connection error: ' + connectionError.stack);
            return res.status(500).json({ error: 'MySQL connection error.' });
        }

        connection.query(deleteCartQuery, [shohin_id , user_id], (error, results, fields) => {
            connection.release(); // コネクションの解放

            if (error) {
                console.error('Error deleting quantity in cart:', error);
                return res.status(500).json({ message: 'Internal server error' });
            } else {
                return res.status(200).json({ message: 'Cart item quantity delete successfully' });
            }
        });
    });
});

module.exports = router;
