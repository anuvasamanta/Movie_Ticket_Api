const express = require('express')
const BookingController = require("../controllers/BookingController")
const route = express.Router();
const AuthCheck=require("../middleware/AuthCheck")
route.get("/list/theather/:movieId", BookingController.listTheather)
route.post("/ticket",AuthCheck,BookingController.bookTicket)
route.delete('/cancel/:id', AuthCheck, BookingController.cancelTicket); 
route.get('/history/:userId', AuthCheck,BookingController.getBookingHistory);
module.exports = route