const dotenv = require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Blog = require("./models/Blogs");
const User = require("./models/Users");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
//const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // <-- location of the react app were connecting to
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

mongoose.connect(process.env.MONGO_URL);

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).send("Unauthorized"); // 401 status code for unauthorized access
  }
};

//----------------------------------------------------ROUTES ARE DEFINED BELOW-----------------------------------------//

app.get("/login", (req, res) => {
  res.json();
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists or wrong credentials");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        //console.log(req.user);
      });
    }
  })(req, res, next);
});

app.post("/register", (req, res) => {
  User.findOne({ username: req.body.username }).then(async (foundUser, err) => {
    if (err) throw err;
    if (foundUser) res.send("Username already exists");

    const hashedPass = await bcrypt.hash(req.body.password, 13);
    //console.log(req.body.username, hashedPass);
    if (!foundUser) {
      const newUser = new User({
        username: req.body.username,
        password: hashedPass,
      });
      await newUser.save();
      res.send("User created");
    }
  });
});

app.get("/getUser", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(req.user));
  console.log(JSON.stringify(req.user));
});

app.get("/getBlogs", isAuthenticated, (req, res) => {
  Blog.find().then((blogs) => res.json(blogs));
});

app.post("/createBlog", isAuthenticated, async (req, res) => {
  const blog = req.body;
  const newBlog = new Blog(blog);
  await newBlog.save();

  res.json(blog);
});

//-----------------------------------------------------END OF ROUTES--------------------------------------------------//

app.listen(3001, () => {
  console.log("Server is running perfectly YOOOOO!");
});
