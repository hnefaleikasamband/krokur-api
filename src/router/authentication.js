import jwt from 'jsonwebtoken';
import Joi from 'joi';
import config from '../config/main';
import { usersQueries, clubsQueries } from '../db/index';
import schema from '../db/schemas';
import utils from '../services/utils';
import logger from '../config/logger';
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
    logger.error('Error fetching club in setUserInfo:', error);
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
  const { iat, exp, ...user } = req.user;
  return res.json(user);
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
    const hashedPw = await utils.hashPassword(validatedUser.password);
    validatedUser.password = hashedPw;
    validatedUser.confirmPassword = hashedPw;
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
    logger.error('Error registering user:', error);
    return res.status(500).json({ error: 'Error saving user, check logs for details' });
  }
};

// ========================================
// Authorization Middleware
// ========================================

// Role authorization check
exports.restrictAccessTo = function hasAccess(roles) {
  return async (req, res, next) => {
    const { user } = req;
    try {
      const currentUser = await usersQueries.findUserById(req.db, user.id);
      // If user is found, check role.
      if (roles.includes(currentUser[0].role)) {
        return next();
      }

      res.status(401).send('Unauthorized');
      return next('Unauthorized');
    } catch (error) {
      logger.error(`Access fail for user: ${user.id}`, error);
      return next('Unauthorized');
    }
  };
};

// ========================================
// List Users
// ========================================
exports.getUsers = async function getUsers(req, res) {
  try {
    const users = await usersQueries.getAllUsers(req.db);

    return res.status(201).json({ users });
  } catch (error) {
    logger.error('Error fetching users from database:', error);
    return res.status(500).json({ error: 'Error fetching users from database' });
  }
};

exports.updatePassword = utils.dreamCatcher(async (req, res) => {
  const { id } = req.params;

  const existingUser = await usersQueries.findUserById(req.db, id);
  if (!existingUser.length > 0) {
    logger.error(`Failed updating password for user: ${id} because there is no user with that id.`);
    return res.status(400).json({ error: 'Bad request' });
  }

  const validObj = await Joi.validate(
    req.body,
    schema.passwordValidation,
    schema.defaultValidationOptions,
  );

  const hashedPassword = await utils.hashPassword(validObj.password);
  await usersQueries.udpatePassword(req.db, id, hashedPassword);
  return res.json({ success: 'Password changed' });
});

exports.updateUser = utils.dreamCatcher(async (req, res) => {
  const user = req.body;
  const { id } = req.params;

  const existingUser = await usersQueries.findUserById(req.db, id);
  if (!existingUser.length > 0) {
    logger.error(`Failed updating user: ${id} because there is no user with that id.`);
    return res.status(400).json({ error: 'Bad request' });
  }

  const validatedUser = await Joi.validate(
    user,
    schema.userWithoutPasswordSchema,
    schema.defaultValidationOptions,
  );
  validatedUser.club = validatedUser.club;

  await usersQueries.updateUserWithoutPassword(req.db, validatedUser);
  return res.status(200).json({ success: 'User updated successfully' });
});

exports.setDisabledValue = utils.dreamCatcher(async (req, res) => {
  const { id } = req.params;
  const { disabled } = req.body;
  await usersQueries.setDisabledValue(req.db, id, !!disabled);
  return res.json({ success: 'Updated disabled value' });
});
