import * as passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import * as LocalStrategy from "passport-local";
import * as bcrypt from "bcryptjs";
import config from "./main";
import { usersQueries } from "../db/index";
import logger from "./logger";

// Login strategy
const localLogin = new LocalStrategy(
  { usernameField: "email", passReqToCallback: true },
  async (req, email, password, done) => {
    try {
      const userData = await usersQueries.findUserByEmail(req.db, email);

      if (
        userData.length > 0 &&
        (await bcrypt.compare(password, userData[0].password))
      ) {
        return done(null, userData[0]);
      }

      return done(null, false, {
        error: "Your login details could not be verified",
      });
    } catch (error) {
      logger.error(error, "Error in login strategy:");
      return done(null, false, {
        error: "Your login details could not be verified",
      });
    }
  }
);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: config.secret,
  passReqToCallback: true,
};

// JWT authentication
const jwtLogin = new JwtStrategy(jwtOptions, async (req, payload, done) => {
  try {
    return done(null, payload);
  } catch (error) {
    logger.error("Error in JWT strategy:", error);
    return done(null, false);
  }
});

const serializeUser = (user, done) => {
  done(null, user);
};

// Google authentication
const googleLogin = new GoogleStrategy(
  {
    clientID: config.googleId,
    clientSecret: config.googleSecret,
    callbackURL: config.googleCallbackUrl,
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const { state } = req.query;
      const userId = state && Buffer.from(state, "base64").toString();

      // If ID is passed, the user is already logged in and trying to link an account
      if (userId) {
        const user = await usersQueries.findUserById(req.db, userId);
        if (user.length > 0) {
          await usersQueries.linkGoogleAccount(req.db, userId, profile.id);
          return done(null, user[0], {
            nextRoute: `${config.krokurWeb}/account`,
          });
        }
      } else {
        const user = await usersQueries.findUserByGoogleId(req.db, profile.id);
        return done(null, user[0]);
      }

      return done(null, false, { error: "No user linked to that account" });
    } catch (error) {
      logger.error(error);
      return done(null, false, {
        error: "Something went wrong, could not verify account",
      });
    }
  }
);

passport.use(jwtLogin);
passport.use(localLogin);
passport.use(googleLogin);
passport.serializeUser(serializeUser);
