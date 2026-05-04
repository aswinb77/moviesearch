const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const Movie = require('./models/Movie');

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/movieapp")
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch((err) => console.log("❌ Database connection error:", err));

// Helpers
const sendList = async (res, query) => {
  try {
    const movies = await Movie.find(query).limit(20);
    const formatted = movies.map(m => ({ ...m._doc, id: m.tmdbId }));
    res.json({ results: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- LIST ENDPOINTS ---
app.get('/api/movies/trending', (req, res) => sendList(res, { isTrending: true }));
app.get('/api/movies/popular', (req, res) => sendList(res, { isPopular: true }));
app.get('/api/movies/upcoming', (req, res) => sendList(res, { isUpcoming: true }));
app.get('/api/movies/now_playing', (req, res) => sendList(res, { isNowPlaying: true }));
app.get('/api/tv/popular', (req, res) => sendList(res, { isTvPopular: true }));
app.get('/api/tv/top_rated', (req, res) => sendList(res, { isTvTopRated: true }));

// --- DETAILS ENDPOINT (Movie or TV) ---
app.get('/api/details/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ tmdbId: req.params.id });
    if (!movie) return res.status(404).json({ error: "Not found in database" });

    // Format the response to match what frontend expects from TMDB deep fetch
    res.json({
      ...movie._doc,
      id: movie.tmdbId, // Frontend expects .id
      credits: { cast: movie.cast },
      videos: { results: movie.videos },
      "watch/providers": { results: movie.watch_providers }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SEARCH ENDPOINT ---
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ results: [] });

    // Perform case-insensitive regex search on title
    const movies = await Movie.find({ title: { $regex: query, $options: "i" } }).limit(20);
    res.json({ results: movies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Route
app.get('/', (req, res) => {
  res.send('Moviecc Custom Backend is running!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
