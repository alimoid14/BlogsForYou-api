const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  date: {
    type: String,
  },
});

const Blog = mongoose.model("blogs", BlogSchema);
module.exports = Blog;
