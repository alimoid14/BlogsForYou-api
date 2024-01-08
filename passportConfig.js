import User from "./models/Users";
import { compare } from "bcryptjs";
import { Strategy as localStrategy } from "passport-local";

export default function (passport) {
  passport.use(
    new localStrategy((username, password, done) => {
      User.findOne({ $or: [{ username: username }, { email: username }] }).then(
        (user, err) => {
          if (err) return done(err);

          if (!user) return done(null, false);

          compare(password, user.password, (err, result) => {
            if (err) throw err;
            if (result) return done(null, user);
            else return done(null, false);
          });
        }
      );
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
}
