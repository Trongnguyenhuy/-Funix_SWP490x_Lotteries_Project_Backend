const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
    // Kiểm Tra Xem Request tới có phải là Request có quyền Admin hay không ?
    const authHeader = req.get("Authorization");

    if (!authHeader) {
        const error = new Error("KHÔNG CÓ THẨM QUYỀN THỰC HIỆN");
        error.StatusCode = 401;
        throw error;
    }

    let token = authHeader.split(" ")[1];
    token = JSON.parse(token);

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, "BB6arv15@#$");

        if (!decodedToken) {
            const error = new Error("KHÔNG CÓ THẨM QUYỀN THỰC HIỆN");
            error.StatusCode = 401;
            throw error;
        }

        const user = await User.find({ _id: decodedToken.userId });

        if (user.length < 1) {
            const error = new Error("KHÔNG TÌM THẤY USER");
            error.StatusCode = 401;
            throw error;
        }

        if (!user[0].isAdmin) {
            const error = new Error("KHÔNG CÓ THẨM QUYỀN THỰC HIỆN");
            error.StatusCode = 401;
            throw error;
        }

        req.user = user;

        next();
    } catch (err) {
        err.StatusCode = 500;
        throw err;
    }
};
