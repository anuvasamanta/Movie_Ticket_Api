const express = require('express')
const AdminController = require('../controllers/AdminController')
const AdminAuthCheck=require("../middleware/AdminAuthCheck")
const router = express.Router()

router.post("/create/movie",AdminAuthCheck,AdminController.checkAuthAdmin,AdminController.createMovie)
router.post("/create/theather",AdminAuthCheck,AdminController.checkAuthAdmin,AdminController.addTheater)
router.post("/assign/movie",AdminAuthCheck,AdminController.checkAuthAdmin,AdminController.assignTheather)
router.get("/list/movie",AdminController.movieList)
router.post("/update/movie/:id",AdminAuthCheck,AdminController.checkAuthAdmin,AdminController.updateMovie)
router.get("/delete/movie/:id",AdminAuthCheck,AdminController.checkAuthAdmin,AdminController.deleteMovie)
router.get('/logout', AdminController.logoutAdmin);
module.exports = router
