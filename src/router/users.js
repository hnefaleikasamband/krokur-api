import { usersQueries } from '../db/index';
import schema from '../db/schemas';
import utils from '../services/utils';
import logger from '../config/logger';

// ========================================
// Register a new Users
// ========================================

const register = async (req, res) => {
  // Check for registration errors
  const user = req.body;

  try {
    const existingUser = await usersQueries.findUserByEmail(req.db, user.email);
    if (existingUser.length > 0) {
      return res.status(400).send({ error: 'User with that email already exists' });
    }

    const { value: validatedUser } = await schema.userSchema.validate(
      user,
      schema.defaultValidationOptions,
    );
    const hashedPw = await utils.hashPassword(validatedUser.password);
    validatedUser.password = hashedPw;
    validatedUser.confirmPassword = hashedPw;

    await usersQueries.addUser(req.db, validatedUser);
    return res.status(201).json();
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Error registering user:', error);
    return res.status(500).json({ error: 'Error saving user, check logs for details' });
  }
};

// ========================================
// List Users
// ========================================
const getUsers = async function getUsers(req, res) {
  try {
    const users = await usersQueries.getAllUsers(req.db);

    return res.status(201).json({ users });
  } catch (error) {
    logger.error('Error fetching users from database:', error);
    return res.status(500).json({ error: 'Error fetching users from database' });
  }
};

const updatePassword = utils.dreamCatcher(async (req, res) => {
  const { id } = req.params;

  const existingUser = await usersQueries.findUserById(req.db, id);
  if (!(existingUser.length > 0)) {
    logger.error(`Failed updating password for user: ${id} because there is no user with that id.`);
    return res.status(400).json({ error: 'Bad request' });
  }

  const { value } = await schema.passwordValidation.validate(
    req.body,
    schema.defaultValidationOptions,
  );

  const hashedPassword = await utils.hashPassword(value.password);
  await usersQueries.updatePassword(req.db, id, hashedPassword);
  return res.json({ success: 'Password changed' });
});

const updateUser = utils.dreamCatcher(async (req, res) => {
  const user = req.body;
  const { id } = req.params;
  const existingUser = await usersQueries.findUserById(req.db, id);
  if (!(existingUser.length > 0)) {
    logger.error(`Failed updating user: ${id} because there is no user with that id.`);
    return res.status(400).json({ error: 'Bad request' });
  }
  if (user.id !== id) {
    return res.status(400).json({ error: 'ID\'s do not match' });
  }
  if (user.role !== utils.ROLES.COACH) {
    user.club = null;
  }

  await schema.userWithoutPasswordSchema.validate(
    user,
    schema.defaultValidationOptions,
  );

  await usersQueries.updateUserWithoutPassword(req.db, user);
  return res.status(200).json({ success: 'User updated successfully' });
});

const setDisabledValue = utils.dreamCatcher(async (req, res) => {
  const { id } = req.params;
  const { disabled } = req.body;
  await usersQueries.setDisabledValue(req.db, id, !!disabled);
  return res.json({ success: 'Updated disabled value' });
});

export default {
  register, getUsers, updatePassword, updateUser, setDisabledValue,
};
