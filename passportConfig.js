const User = require("./models/Users");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new localStrategy((username, password, done) => {
      User.findOne({ username: username }).then((user, err) => {
        if (err) return done(err);

        if (!user) return done(null, false);

        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result) return done(null, user);
          else return done(null, false);
        });
      });
    })
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    User.findOne({ _id: id }).then((user, err) => {
      if (!user) {
        return cb(null, false); // User not found
      }
      const userInformation = {
        username: user.username,
      };
      cb(err, userInformation);
    });
  });
};
