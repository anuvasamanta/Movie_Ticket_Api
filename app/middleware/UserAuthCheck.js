
const jwt = require("jsonwebtoken");
const User = require('../model/userModel'); 

const Auth = async (req, res, next) => {
    try {
        if (req.cookies && req.cookies.userToken) {
            const decoded = jwt.verify(
                req.cookies.userToken, 
                process.env.JWT_SECRET || "hellowelcometowebskittersacademy123456"
            );
            
            // Fetch fresh user data from database
            const user = await User.findById(decoded.id || decoded._id);
            
            if (!user) {
                console.log(' User not found in database');
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Set req.user with proper structure
            req.user = {
                _id: user._id,
                id: user._id.toString(),
                email: user.email,
                name: user.name
                // Add other fields you need
            };
            
            console.log('User authenticated:', req.user._id);
            next();
        } else {
            console.log('No userToken found in cookies');
            req.user = null;
            next();
        }
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        req.user = null;
        next();
    }
};

module.exports = Auth;