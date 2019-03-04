import jwt from 'jsonwebtoken';
import config from '../config/main';
// import User from '../models/user';
import { findUser } from '../db/queries/users';
// To be able to run async/await
import '@babel/polyfill';

function generateToken(user) {
  return jwt.sign(user, config.secret, { expiresIn: '180m' });
  // Used while trying out timeouts.
  // return jwt.sign(user, config.secret, { expiresIn: '2m' });
}

function setUserInfo(request) {
  return {
    // eslint-disable-next-line
    id: request.id,
    name: request.name,
    email: request.email,
    access: request.access,
  };
}

// ========================================
// Login Route, this fn is only called if
// the passport un/pw login is successful.
// ========================================
exports.login = function login(req, res) {
  const userInfo = setUserInfo(req.user);

  res.status(200).json({
    token: `JWT ${generateToken(userInfo)}`,
    // TODO: Revisit this and decide if we want to decode JWT in frontend or send like this.
    user: {
      name: userInfo.name,
      email: userInfo.email,
    },
    expiresIn: 10800,
  });
};

// ========================================
// Return the User who owns the JWT token
// ========================================
exports.authedUser = function authedUser(req, res) {
  const userInfo = setUserInfo(req.user);
  if (!req.user || req.user === undefined) {
    return res.status(404).send();
  }
  return res.json(userInfo);
};

// ========================================
// Registration Route
// ========================================
exports.register = async function register(req, res) {
  // Check for registration errors
  const {
    email, name, password, access, club,
  } = req.body;

  try {
    const existingUser = await findUser(req.db, email);
    if (existingUser) {
      return res.status(400).send({ error: 'User with that email already exists' });
    }
    // TODO: Should this check be here, if coaches are added and no club assigned error.
    /*
        if((access && access.toLowerCase() === 'read') && (!club || club === '')) {
            return
        } */

    const user = new User({
      email,
      name,
      password,
      access,
      club,
    });

    await user.validate();
    await user.save();
    const userInfo = setUserInfo(user);
    return res.status(201).json({
      token: `JWT ${generateToken(userInfo)}`,
      user: userInfo,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    // FIXME: This needs to be logged properly!!
    console.log('Error saving user:', error);
    return res.status(500).json({ error: 'Error saving user, check logs for details' });
  }
};

// ========================================
// Authorization Middleware
// ========================================

const accessAvailable = {
  read: 0,
  write: 1,
  admin: 2,
  superadmin: 3,
};

// Role authorization check
exports.hasAccess = function hasAccess(access) {
  return (req, res, next) => {
    const { user } = req;

    // eslint-disable-next-line
    User.findById(user._id, (err, foundUser) => {
      if (err) {
        res.status(422).json({ error: 'No user was found.' });
        return next(err);
      }

      // If user is found, check role.
      if (accessAvailable[foundUser.access] >= accessAvailable[access]) {
        return next();
      }

      res.status(401).json({ error: 'You are not authorized to view this content.' });
      return next('Unauthorized');
    });
  };
};

// ========================================
// List Users
// ========================================
exports.getUsers = async function getUsers(req, res) {
  try {
    // TODO: We will need to clean up this data before sending it (e.g. passwords)
    const users = await User.find({});

    return res.status(201).json({ users });
  } catch (error) {
    // FIXME: This needs to be logged properly!!
    console.log('Error fetching users from database:', error);
    return res.status(500).json({ error: 'Error fetching users from database' });
  }
};
