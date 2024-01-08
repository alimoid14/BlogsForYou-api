const dotenv = require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Blog = require("./models/Blogs");
const User = require("./models/Users");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
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
    store: new MongoStore(options),
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
  passport.authenticate("local", (error, user, info) => {
    if (error) console.log(error);
    if (!user) res.send("No User Exists or wrong credentials");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
      });
    }
  })(req, res, next);
});

app.post("/register", (req, res) => {
  User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  }).then(async (foundUser, error) => {
    if (error) console.log(error);
    if (foundUser)
      res.send("An account with this email/username already exists");

    const hashedPass = await bcrypt.hash(req.body.password, 13);
    if (!foundUser) {
      const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: hashedPass,
      });
      await newUser.save();
      res.send("User created");
    }
  });
});

app.post("/logout", function (req, res, next) {
  console.log(req.userInformation);
  req.logOut(function (error) {
    if (error) {
      return next(error);
    }
    res.json();
  });
});

app.get("/User", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(req.user));
});

app.get("/Blogs", (req, res) => {
  Blog.find().then((blogs, error) => {
    if (error) console.log(error);
    res.json(blogs);
  });
});

app.post("/Blogs", isAuthenticated, async (req, res) => {
  const blog = req.body;
  const newBlog = new Blog(blog);
  await newBlog.save();

  res.json(blog);
});

app.get("/Blogs/:id", (req, res) => {
  const id = req.params.id;
  Blog.findById(id).then((blog, error) => {
    if (error) console.log(error);
    res.json(blog);
  });
});

app.delete("/Blogs/:id", isAuthenticated, (req, res) => {
  console.log(req.params.id);
  Blog.findByIdAndDelete(req.params.id).then((result, error) => {
    if (error) console.log(error);
    else console.log(result);
  });
});

app.put("/Blogs/:id", isAuthenticated, (req, res) => {
  Blog.findByIdAndUpdate(req.params.id, { content: req.body.content }).then(
    (result, error) => {
      console.log(req.params.id);
      res.send("Succesfully made the changes");
      if (error) console.log(error);
    }
  );
});

app.post("/checkUsername", (req, res) => {
  User.findOne({
    username: req.body.username,
  }).then(async (foundUser, error) => {
    if (error) console.log(error);
    if (foundUser) res.send("username already exists");
    else res.send("");
  });
});

app.post("/checkEmail", (req, res) => {
  User.findOne({
    email: req.body.email,
  }).then(async (foundUser, error) => {
    if (error) console.log(error);
    if (foundUser) res.send("account with this email already exists");
    else res.send("");
  });
});

app.get("/UserName", (req, res) => {
  User.findOne({ username: req.query.username }).then((foundUser, error) => {
    if (foundUser) res.send(JSON.stringify({ username: foundUser.username }));
    else res.send("");
    if (error) console.log(error);
  });
});

app.get("/BlogsByUser", (req, res) => {
  //console.log(req.query);
  Blog.find({ username: req.query.username }).then((blogs, error) => {
    if (error) console.log(error);
    res.json(blogs);
  });
});

//-----------------------------------------------------END OF ROUTES--------------------------------------------------//

app.listen(3001, () => {
  console.log("Server is running perfectly YOOOOO!");
});
