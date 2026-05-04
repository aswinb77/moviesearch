const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: String,
  overview: String,
  release_date: String,
  vote_average: Number,
  poster_url: String, 
  backdrop_url: String,
  isTv: { type: Boolean, default: false },
  number_of_episodes: Number,

  // Deep Details
  genres: [{ id: Number, name: String }],
  cast: [{
    id: Number,
    name: String,
    profile_path: String
  }],
  videos: [{
    type: { type: String },
    key: String,
    site: String
  }],
  watch_providers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Category Flags
  isTrending: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isUpcoming: { type: Boolean, default: false },
  isNowPlaying: { type: Boolean, default: false },
  isTvPopular: { type: Boolean, default: false },
  isTvTopRated: { type: Boolean, default: false }
});

module.exports = mongoose.model('Movie', movieSchema);
