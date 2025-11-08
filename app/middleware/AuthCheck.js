const jwt = require('jsonwebtoken')
const AuthCheck = async (req, res, next) => {
    const token = req?.body?.token || req?.query?.token || req?.headers['x-access-token'] || req?.headers['authorization'];

    if (!token) {
        return res.status(400).json({
            status: false,
            message: "Token is required for access this page"
        })

    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRECT || "hellowelcometowebskittersacademy123456" || process.env.JWT_SECRET_ADMIN || "hellowelcomeAdmin123456");
        req.user = decoded;
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: "Invalid token"
        })
    }
    return next();
}

module.exports = AuthCheck;