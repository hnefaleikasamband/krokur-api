import passport from "passport";
import User from "../models/user";
import config from "./main";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import LocalStrategy from "passport-local";

// Login strategy
const localLogin = new LocalStrategy(
  { usernameField: "email" },
  (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          error: "Your login details could not be verified"
        });
      }

      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          return done(err);
        }
        if (!isMatch) {
          return done(null, false, {
            error: "Your login details could not be verified"
          });
        }

        return done(null, user);
      });
    });
  }
);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: config.secret
};

// JWT authentication
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload._id, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

passport.use(jwtLogin);
passport.use(localLogin);
