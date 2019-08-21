import Router from 'express';
import passport from 'passport';
import '../config/passport';
import AuthAccess from './authentication';
import athletes from './athletes';
import club from './clubs';
import users from './users';
import utils from '../services/utils';

// Middleware for login and auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

export default function (app) {
  const apiRoutes = new Router();

  const { ADMIN, COACH, JUDGE } = utils.ROLES;

  apiRoutes.post('/auth/login', requireLogin, AuthAccess.login);
  apiRoutes.get('/auth/user', requireAuth, AuthAccess.authedUser);
  apiRoutes.post(
    '/auth/register',
    requireAuth,
    AuthAccess.restrictAccess([ADMIN]),
    AuthAccess.register,
  );
  apiRoutes.use('/users', requireAuth, users);
  apiRoutes.use('/athletes', requireAuth, athletes);
  apiRoutes.use('/clubs', requireAuth, club);

  apiRoutes.get('/', requireAuth, (req, res) => {
    res.json({ success: true });
  });

  app.use('/api/v1', apiRoutes);
  app.get('/api/health-check', (req, res) => res.json({ message: "I'm healthy" }));
}
