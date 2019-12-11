import Router from 'express';
import passport from 'passport';
import '../config/passport';
import AuthAccess from './authentication';
import athletes from './athletes';
import club from './clubs';
import users from './users';
import utils from '../services/utils';
import config from '../config/main';

// Middleware for login and auth
const requireAuth = passport.authenticate('jwt', { session: false });

export default function (app) {
  app.use(passport.initialize());
  const apiRoutes = new Router();

  const { ADMIN, COACH, JUDGE } = utils.ROLES;

  apiRoutes.post('/auth/login', passport.authenticate('local', { session: false }), AuthAccess.login);
  apiRoutes.get('/auth/google', (req, res, next) => {
    const { id } = req.query;
    const state = id ? Buffer.from(id).toString('base64') : undefined;
    const authenticator = passport.authenticate('google', { session: false, scope: ['profile', 'email'], state });
    authenticator(req, res, next);
  });

  apiRoutes.get(
    '/auth/google/redirect',
    passport.authenticate('google', { failureRedirect: `${config.krokurWeb}/login` }),
    AuthAccess.redirectLogin,
  );

  apiRoutes.post(
    '/auth/register',
    requireAuth,
    AuthAccess.restrictAccessTo([ADMIN]),
    AuthAccess.register,
  );
  apiRoutes.get('/auth/user', requireAuth, AuthAccess.authedUser);

  apiRoutes.use('/users', requireAuth, users);
  apiRoutes.use('/athletes', requireAuth, athletes);
  apiRoutes.use('/clubs', requireAuth, club);

  apiRoutes.get('/', requireAuth, (req, res) => {
    res.json({ success: true });
  });

  app.use('/api/v1', apiRoutes);
  app.get('/api/health-check', (req, res) => res.json({ message: "I'm healthy" }));
}
