const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  allowEIO3: true,          // allow older socket.io clients
  transports: ['polling', 'websocket'],
});
app.use(cors(corsOptions));
app.use(express.json());

const Movie = require('./models/Movie');
const Ticket = require('./models/Ticket');
const Favorite = require('./models/Favorite');
const Post = require('./models/Post');

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

// --- TICKET ENDPOINTS ---
app.post('/api/tickets/scan', async (req, res) => {
  try {
    const { userId, movieTitle, date, theatre, seat, digitalKey } = req.body;

    if (!digitalKey) {
      return res.status(400).json({ error: "Digital key is required." });
    }

    // Check if key already exists to prevent duplicate scanning / fraud
    const existingTicket = await Ticket.findOne({ digitalKey });
    if (existingTicket) {
      return res.status(400).json({ error: "Fraud detected: Ticket already scanned." });
    }

    const newTicket = new Ticket({
      userId: userId || 'anonymous',
      movieTitle: movieTitle || 'Unknown Movie',
      date: date || new Date().toISOString(),
      theatre: theatre || 'Unknown Theatre',
      seat: seat || 'Unknown Seat',
      digitalKey
    });

    await newTicket.save();
    res.status(201).json({ message: "Ticket successfully verified and stored.", ticket: newTicket });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Fraud detected: Ticket already scanned." });
    }
    res.status(500).json({ error: error.message });
  }
});

// --- FAVORITES ENDPOINTS ---
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ results: favorites.map(f => f.movieDetails) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { userId, movieDetails } = req.body;
    if (!userId || !movieDetails || !movieDetails.id) {
      return res.status(400).json({ error: "userId and movieDetails with id are required" });
    }
    
    const existing = await Favorite.findOne({ userId, movieId: movieDetails.id });
    if (existing) {
      return res.status(400).json({ error: "Already in favorites" });
    }

    const fav = new Favorite({ userId, movieId: movieDetails.id, movieDetails });
    await fav.save();
    res.status(201).json({ message: "Added to favorites", favorite: fav });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: "Already in favorites" });
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/favorites/:userId/:movieId', async (req, res) => {
  try {
    const { userId, movieId } = req.params;
    await Favorite.findOneAndDelete({ userId, movieId: Number(movieId) });
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MOCK AUTH ENDPOINTS FOR LOCAL TESTING ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  
  res.json({
    token: 'mock_jwt_token',
    _id: 'local_user_123',
    username: email.split('@')[0],
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  res.status(201).json({
    token: 'mock_jwt_token',
    _id: 'local_user_123',
    username: username || 'LocalUser',
  });
});

// --- POSTS (FEED) ENDPOINTS ---
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ results: posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, type, trailerUrl, authorName, authorId } = req.body;
    const post = new Post({ title, content, type, trailerUrl, authorName, authorId });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const index = post.likesList.indexOf(userId);
    if (index === -1) {
      post.likesList.push(userId);
    } else {
      post.likesList.splice(index, 1);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ error: "comment required" });
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.commentsList.push(comment);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Route
app.get('/', (req, res) => {
  res.send('Moviecc Custom Backend is running!');
});

// --- SOCKET.IO CHAT LOGIC ---
let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  io.emit('online_users_count', onlineUsers);

  socket.on('send_message', (data) => {
    const { userId, username, avatar } = socket.handshake.auth;
    const msg = {
      _id: new mongoose.Types.ObjectId(),
      senderId: userId || 'anon',
      senderName: username || 'Anonymous',
      senderAvatar: avatar || '',
      text: data.text,
      createdAt: new Date()
    };
    io.emit('receive_message', msg);
  });

  socket.on('disconnect', () => {
    onlineUsers--;
    io.emit('online_users_count', onlineUsers);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
