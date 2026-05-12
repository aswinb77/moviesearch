const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  movieId: { type: Number, required: true },
  movieDetails: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
