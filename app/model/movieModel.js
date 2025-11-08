const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  Movie_name: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: [String],
    required: true
  },
  language: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  cast: {
    type: [String],
    required: true
  },
  director: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
