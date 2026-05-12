const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  movieTitle: { type: String, required: true },
  date: { type: String, required: true },
  theatre: { type: String, required: true },
  seat: { type: String, required: true },
  digitalKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);
