const express = require('express')
const UserController = require('../controllers/UserController')
const upload = require('../config/multerConfig')
const AuthCheck = require('../middleware/AuthCheck')
const router = express.Router();


router.use((req, res, next) => {
    next();
});


const handleUpload = (req, res, next) => {
    upload.single('profile')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: `Upload failed: ${err.message}`
            });
        }
        next();
    });
};

router.post('/register', handleUpload, UserController.register)
router.post('/verify', UserController.verify)
router.post('/login', UserController.createLogin)
router.get('/user/profile', AuthCheck, UserController.getProfile)
router.put('/profile/update', AuthCheck, handleUpload, UserController.updateProfile)
router.delete('/user/logout',AuthCheck, UserController.logoutUser)

module.exports = router