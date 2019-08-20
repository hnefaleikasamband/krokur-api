import jwt from 'jsonwebtoken';
import Joi from 'joi';
import config from '../config/main';
import { usersQueries, clubsQueries } from '../db/index';
import schema from '../db/schemas';
import utils from '../services/utils';
// To be able to run async/await
import '@babel/polyfill';

function generateToken(user) {
  return jwt.sign(user, config.secret, { expiresIn: '180m' });
  // Used while trying out timeouts.
  // return jwt.sign(user, config.secret, { expiresIn: '2m' });
}

async function setUserInfo(db, user) {
  let club;
  try {
    club = user.club ? (await clubsQueries.findClubById(db, user.club))[0] : null;
  } catch (error) {
    console.log('<> Error fetching club in setUserInfo:', error);
    club = null;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    club,
  };
}

exports.login = async function login(req, res) {
  const userInfo = await setUserInfo(req.db, req.user);
  res.status(200).json({
    token: `${generateToken(userInfo)}`,
    userInfo,
    expiresIn: 10800,
  });
};

exports.authedUser = async function authedUser(req, res) {
  if (!req.user || req.user === undefined) {
    return res.status(401).send();
  }
  const userInfo = await setUserInfo(req.db, req.user);
  return res.json(userInfo);
};

exports.register = async function register(req, res) {
  // Check for registration errors
  const user = req.body;

  try {
    const existingUser = await usersQueries.findUserByEmail(req.db, user.email);
    if (existingUser.length > 0) {
      return res.status(400).send({ error: 'User with that email already exists' });
    }

    const validatedUser = await Joi.validate(
      user,
      schema.userSchema,
      schema.defaultValidationOptions,
    );
    validatedUser.password = await utils.hashPassword(validatedUser.password);
    validatedUser.club = validatedUser.club;

    const newUser = await usersQueries.addUser(req.db, validatedUser);
    const userInfo = await setUserInfo(req.db, newUser);
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

// Role authorization check
exports.restrictAccess = function hasAccess(roles) {
  return async (req, res, next) => {
    try {
      const { user } = req;
      const currentUser = await usersQueries.findUserById(req.db, user.id);
      // If user is found, check role.
      if (roles.includes(currentUser[0].role)) {
        return next();
      }

      res.status(401).send('Unauthorized');
      return next('Unauthorized');
    } catch (error) {
      console.error('Access fail:', error);
      return next('Unauthorized');
    }
  };
};

// ========================================
// List Users
// ========================================
exports.getUsers = async function getUsers(req, res) {
  try {
    // TODO: We will need to clean up this data before sending it (e.g. passwords)
    const users = await usersQueries.getAllUsers(req.db);

    return res.status(201).json({ users });
  } catch (error) {
    // FIXME: This needs to be logged properly!!
    console.log('Error fetching users from database:', error);
    return res.status(500).json({ error: 'Error fetching users from database' });
  }
};

exports.updatePassword = utils.dreamCatcher(async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const validObj = await Joi.validate(
    req.body,
    schema.passwordValidation,
    schema.defaultValidationOptions,
  );

  const hashedPassword = await utils.hashPassword(validObj.password);
  await usersQueries.udpatePassword(req.db, id, hashedPassword);
  return res.json({ success: 'Password changed' });
});
