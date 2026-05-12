const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, default: 'news' },
  trailerUrl: { type: String },
  authorName: { type: String, required: true },
  authorId: { type: String },
  createdAt: { type: Date, default: Date.now },
  likesList: [{ type: String }], // array of userIds
  commentsList: [{ type: String }] // array of comment text
});

module.exports = mongoose.model('Post', postSchema);
