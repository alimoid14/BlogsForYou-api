const User = require("./models/Users");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new localStrategy((username, password, done) => {
      User.findOne({ $or: [{ username: username }, { email: username }] }).then(
        (user, err) => {
          if (err) return done(err);

          if (!user) return done(null, false);

          bcrypt.compare(password, user.password, (err, result) => {
            if (err) throw err;
            if (result) return done(null, user);
            else return done(null, false);
          });
        }
      );
    })
  );

  passport.serializeUser((user, cb) => {
    console.log("Serializing user:", user.username);
    cb(null, user._id);
  });

  passport.deserializeUser((_id, cb) => {
    console.log("Deserializing user with ID:", _id);
    User.findOne({ _id: _id }).then((user, err) => {
      if (!user) {
        console.log("User not found during deserialization");
        return cb(null, false); // User not found
      }
      const userInformation = {
        username: user.username,
      };
      console.log("Deserialized user information:", userInformation);
      cb(err, userInformation);
    });
  });
};
