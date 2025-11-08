const express=require("express")
const route=express.Router()
const ReportsController=require("../controllers/ReportController")

route.get("/movies-bookings",ReportsController.getTotalBookings)
route.get("/bookings-by-theater",ReportsController.getBookingsByTheater)


module.exports=route