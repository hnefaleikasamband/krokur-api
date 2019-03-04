import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcryptjs';
import config from './main';
import User from '../models/user';
import { usersQueries } from '../db/index';

// Login strategy
const localLogin = new LocalStrategy(
  { usernameField: 'email', passReqToCallback: true },
  async (req, email, password, done) => {
    try {
      const userData = await usersQueries.findUser(req.db, email);

      if (userData && bcrypt.compare(password, userData.password)) {
        return done(null, { user: userData });
      }

      return done(null, false, { error: 'Your login details could not be verified' });
    } catch (error) {
      return done(null, false, { error: 'Your login details could not be verified' });
    }
  },
);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: config.secret,
};

// JWT authentication
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // eslint-disable-next-line
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
