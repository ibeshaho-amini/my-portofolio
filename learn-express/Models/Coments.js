const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema({
  like: {
    type: Number,
    required: true,
    default: 0,
  },
  blog_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blogs",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
  },
});

module.exports = mongoose.model("CommentLike", commentLikeSchema);
