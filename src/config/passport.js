import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcryptjs';
import config from './main';
import { usersQueries } from '../db/index';

// Login strategy
const localLogin = new LocalStrategy(
  { usernameField: 'email', passReqToCallback: true },
  async (req, email, password, done) => {
    try {
      const userData = await usersQueries.findUserByEmail(req.db, email);

      if (userData.length > 0 && (await bcrypt.compare(password, userData[0].password))) {
        return done(null, userData[0]);
      }

      return done(null, false, { error: 'Your login details could not be verified' });
    } catch (error) {
      console.log('Error in login strategy:', error);
      return done(null, false, { error: 'Your login details could not be verified' });
    }
  },
);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: config.secret,
  passReqToCallback: true,
};

// JWT authentication
const jwtLogin = new JwtStrategy(jwtOptions, async (req, payload, done) => {
  // eslint-disable-next-line
  try {
    const user = await usersQueries.findUserById(req.db, payload.id);
    return user ? done(null, user[0]) : done(null, false);
  } catch (error) {
    console.log('Error in JWT strategy:', error);
    return done(null, false);
  }
});

passport.use(jwtLogin);
passport.use(localLogin);
