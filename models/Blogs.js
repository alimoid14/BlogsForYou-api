import { Schema, model } from "mongoose";

const BlogSchema = new Schema({
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

const Blog = model("blogs", BlogSchema);
export default Blog;
