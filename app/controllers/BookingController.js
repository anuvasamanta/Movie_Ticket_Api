const mongoose = require('mongoose');
const TheatherModel = require("../model/theatherModel")
const Booking = require("../model/bookingModel");
const movieModel = require('../model/movieModel');
const {sendBookingConfirmationEmail}=require("../helper/EmailVerify")
class BookingController {
  //List of Theaters for a Movie
  async listTheather(req, res) {
    try {
      const { movieId } = req.params;
      const theaters = await TheatherModel.aggregate([
        {
          $unwind: "$screens"
        },
        {
          $unwind: "$screens.movies"
        },
        {
          $match: {
            "screens.movies.movieId": new mongoose.Types.ObjectId(movieId)
          }
        },
        {
          $group: {
            _id: "$_id",
            Theater_name: { $first: "$Theater_name" },
            location: { $first: "$location" },
            screens: {
              $push: {
                screenNumber: "$screens.number",
                showTimings: "$screens.movies.showTimings"
              }
            }
          }
        }
      ]);
      return res.status(200).json(theaters);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Book Tickets for a Movie
  async bookTicket(req, res) {
    try {
      const { movieId, theaterId, showTiming, tickets, userEmail } = req.body;

      // Validation
      if (!movieId || !theaterId || !showTiming || !tickets) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const theater = await TheatherModel.findById(theaterId);
      if (!theater) return res.status(404).json({ message: "Theater not found" });

      let show;
      let screenFound;
      let movieFound;

      // Find the specific show
      theater.screens.forEach(screen => {
        screen.movies.forEach(movie => {
          if (movie.movieId.toString() === movieId &&
            movie.showTimings.some(timing => timing.time === showTiming)) {
            show = movie;
            screenFound = screen;
            movieFound = movie;
          }
        });
      });

      if (!show) return res.status(400).json({ message: "Show not found" });

      // Find the specific show timing
      const timingObj = show.showTimings.find(timing => timing.time === showTiming);
      if (!timingObj) return res.status(400).json({ message: "Show timing not found" });

      if (timingObj.availableSeats < tickets) {
        return res.status(400).json({
          message: "Not enough seats available",
          availableSeats: timingObj.availableSeats
        });
      }

      // Update available seats
      timingObj.availableSeats -= tickets;
      await theater.save();

      // Create booking
      const booking = await Booking.create({
        user: req.user?.id,
        movie: movieId,
        theater: theaterId,
        showTiming,
        tickets,
        status: "Booked"
      });

      // Get movie details for email
      const Movie = require('../model/movieModel');
      const movie = await movieModel.findById(movieId);

      // Get user details (if available)
      const User = require('../model/userModel');
      const user = req.user?.id ? await User.findById(req.user.id) : null;

      // Prepare email data
      const emailData = {
        userEmail: userEmail || (user ? user.email : null),
        bookingId: booking._id.toString(),
        movieName: movie ? movie.Movie_name : 'Unknown Movie',
        theaterName: theater.Theater_name,
        location: theater.location,
        screenNumber: screenFound ? screenFound.number : 'N/A',
        showTiming: showTiming,
        tickets: tickets,
        totalAmount: tickets * (timingObj.price || 200),
        userName: user ? user.name : 'Customer'
      };

      // Send confirmation email if email is available
      let emailSent = false;
      if (emailData.userEmail) {
        emailSent = await sendBookingConfirmationEmail(emailData);
      }

      res.status(201).json({
        success: true,
        message: "Tickets booked successfully" + (emailSent ? " and confirmation email sent" : ""),
        data: {
          bookingId: booking._id,
          movie: movieId,
          movieName: movie ? movie.Movie_name : 'Unknown Movie',
          theater: theater.Theater_name,
          showTiming,
          tickets,
          totalAmount: emailData.totalAmount,
          seatAvailability: {
            remainingSeats: timingObj.availableSeats
          },
          emailSent: emailSent,
          userEmail: emailData.userEmail
        }
      });

    } catch (err) {
      console.error("Book ticket error:", err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  // cancel booking
  async cancelTicket(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.status === "Cancelled") {
        return res.status(400).json({ message: "Booking is already cancelled" });
      }

      // Update booking status
      booking.status = "Cancelled";
      await booking.save();

      // Update theater
      const theater = await TheaterModel.findById(booking.theater);

      if (!theater) {
        return res.status(404).json({ message: "Theater not found" });
      }

      // Find the specific show timing
      const movieShow = theater.movies.find(movie =>
        movie.movie.toString() === booking.movie.toString()
      );

      if (!movieShow) {
        return res.status(404).json({ message: "Movie show not found" });
      }

      // If showTimings is an array of objects with time and availableSeats
      const showTiming = movieShow.showTimings.find(show =>
        show.time === booking.showTiming
      );

      if (showTiming) {
        showTiming.availableSeats += booking.tickets;
        await theater.save();
      }

      res.json({
        message: "Booking cancelled successfully",
        ticketsRefunded: booking.tickets
      });

    } catch (err) {
      console.error("Cancel ticket error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  // 4. View Booking History
  async getBookingHistory(req, res) {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Using aggregation to get detailed booking history
      const bookingHistory = await Booking.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: 'movies',
            localField: 'movie',
            foreignField: '_id',
            as: 'movieDetails'
          }
        },
        {
          $lookup: {
            from: 'theaters',
            localField: 'theater',
            foreignField: '_id',
            as: 'theaterDetails'
          }
        },
        {
          $unwind: {
            path: '$movieDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$theaterDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $project: {
            _id: 1,
            showTiming: 1,
            tickets: 1,
            status: 1,
            createdAt: 1,
            'movieDetails.title': 1,
            'movieDetails.genre': 1,
            'movieDetails.duration': 1,
            'theaterDetails.Theater_name': 1,
            'theaterDetails.location': 1,
            totalAmount: { $multiply: ['$tickets', 200] }
          }
        }
      ]);

      if (bookingHistory.length === 0) {
        return res.status(404).json({
          success: true,
          message: "No bookings found for this user",
          data: []
        });
      }

      res.json({
        success: true,
        data: bookingHistory
      });

    } catch (err) {
      console.error("Get booking history error:", err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

}

module.exports = new BookingController();