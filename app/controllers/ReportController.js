const Booking = require("../model/bookingModel");
const Movie = require("../model/movieModel"); // Import Movie model

class ReportsController {
  
  // List of Movies with Total Bookings
  async getTotalBookings(req, res) {
    try {
      const moviesWithBookings = await Booking.aggregate([
        {
          $lookup: {
            from: 'movies',
            localField: 'movie',
            foreignField: '_id',
            as: 'movieDetails'
          }
        },
        {
          $unwind: {
            path: '$movieDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            status: 'Booked'
          }
        },
        {
          $group: {
            _id: '$movie',
            movieName: { $first: '$movieDetails.Movie_name' }, 
            totalTicketsBooked: { $sum: '$tickets' },
            totalBookings: { $sum: 1 },
            averageTicketsPerBooking: { $avg: '$tickets' }
          }
        },
        {
          $project: {
            _id: 1,
            movieName: 1,
            totalTicketsBooked: 1,
            totalBookings: 1,
            averageTicketsPerBooking: { $round: ['$averageTicketsPerBooking', 2] }
          }
        },
        {
          $sort: { totalTicketsBooked: -1 }
        }
      ]);

      const processedData = moviesWithBookings.map(movie => ({
        ...movie,
        movieName: movie.movieName || 'Unknown Movie'
      }));

      const totalTickets = processedData.reduce((sum, movie) => sum + movie.totalTicketsBooked, 0);
      const totalBookings = processedData.reduce((sum, movie) => sum + movie.totalBookings, 0);

      res.json({
        success: true,
        data: processedData,
        summary: {
          totalMovies: processedData.length,
          totalTickets: totalTickets,
          totalBookings: totalBookings
        }
      });

    } catch (err) {
      console.error("Get movies with bookings error:", err);
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  // List of Bookings by Theater 
  async getBookingsByTheater(req, res) {
    try {
      const bookingsByTheater = await Booking.aggregate([
        {
          $lookup: {
            from: 'theaters',
            localField: 'theater',
            foreignField: '_id',
            as: 'theaterDetails'
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
          $unwind: {
            path: '$theaterDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$movieDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            status: 'Booked'
          }
        },
        {
          $group: {
            _id: {
              theaterId: '$theater',
              theaterName: '$theaterDetails.Theater_name',
              location: '$theaterDetails.location',
              movieId: '$movie',
              movieName: '$movieDetails.Movie_name', 
              showTiming: '$showTiming'
            },
            totalTickets: { $sum: '$tickets' },
            totalBookings: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              theaterId: '$_id.theaterId',
              theaterName: '$_id.theaterName',
              location: '$_id.location'
            },
            movies: {
              $push: {
                movieId: '$_id.movieId',
                movieName: '$_id.movieName',
                showTiming: '$_id.showTiming',
                totalTickets: '$totalTickets',
                totalBookings: '$totalBookings'
              }
            },
            totalTheaterTickets: { $sum: '$totalTickets' },
            totalTheaterBookings: { $sum: '$totalBookings' }
          }
        },
        {
          $project: {
            _id: 0,
            theaterId: '$_id.theaterId',
            theaterName: '$_id.theaterName',
            location: '$_id.location',
            movies: 1,
            totalTheaterTickets: 1,
            totalTheaterBookings: 1
          }
        },
        {
          $sort: { totalTheaterTickets: -1 }
        }
      ]);

      const processedData = bookingsByTheater.map(theater => ({
        ...theater,
        movies: theater.movies.map(movie => ({
          ...movie,
          movieName: movie.movieName || 'Unknown Movie'
        }))
      }));

      const grandTotalTickets = processedData.reduce((sum, theater) => sum + theater.totalTheaterTickets, 0);
      const grandTotalBookings = processedData.reduce((sum, theater) => sum + theater.totalTheaterBookings, 0);

      res.json({
        success: true,
        data: processedData,
        summary: {
          totalTheaters: processedData.length,
          grandTotalTickets: grandTotalTickets,
          grandTotalBookings: grandTotalBookings
        }
      });

    } catch (err) {
      console.error("Get bookings by theater error:", err);
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }


}

module.exports = new ReportsController();