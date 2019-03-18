import Router from 'express';
import passport from 'passport';
import '../config/passport';
import AuthAccess from './authentication';
import athletes from './athletes';
import club from './clubs';

// Middleware for login and auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

// Access constants
const REQUIRE = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export default function (app) {
  const apiRoutes = new Router();

  apiRoutes.post('/auth/register', requireAuth, AuthAccess.register);
  apiRoutes.post('/auth/login', requireLogin, AuthAccess.login);
  apiRoutes.get('/auth/user', requireAuth, AuthAccess.authedUser);
  apiRoutes.get('/users', requireAuth, AuthAccess.getUsers);
  apiRoutes.post('/users', requireAuth, AuthAccess.register);
  apiRoutes.use('/athletes', requireAuth, athletes);
  apiRoutes.use('/clubs', requireAuth, club);

  apiRoutes.get('/', requireAuth, (req, res) => {
    res.json({ success: true });
  });

  app.use('/api/v1', apiRoutes);
  app.get('/api/health-check', (req, res) => res.json({ message: "I'm healthy" }));
}
