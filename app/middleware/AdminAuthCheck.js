const jwt = require('jsonwebtoken');

const adminAuthCheck = (req, res, next) => {
  if (req.cookies && req.cookies.adminToken) {
    jwt.verify(req.cookies.adminToken, process.env.JWT_SECRET_ADMIN || "hellowelcomeAdmin123456", (err, data) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      req.admin = data;
      next();
    });
  } else {
    return res.status(401).json({ message: 'Admin token is required' });
  }
};

module.exports = adminAuthCheck;
