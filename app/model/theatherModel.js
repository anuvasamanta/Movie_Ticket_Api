const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  Theater_name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  screens: [
    {
      number: {
        type: Number,
        required: true,
        min: 1
      },
      movies: [
        {
          movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
          },
          showTimings: [
            {
              time: {
                type: String,
                required: true
              }
            }
          ],
          availableSeats: { type: Number, default: 100 },
        }
      ]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Theater', theaterSchema);