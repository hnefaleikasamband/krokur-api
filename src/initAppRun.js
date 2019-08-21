import Joi from 'joi';
import { usersQueries } from './db/index';
import schema from './db/schemas';
import utils from './services/utils';
import logger from './config/logger';

async function addSuperUser(dbConn) {
  const user = {
    email: 'admin@admin.is',
    password: 'admin',
    confirmPassword: 'admin',
    name: 'Administrator',
    disabled: 'false',
    role: 'ADMIN',
  };

  const validatedUser = await Joi.validate(
    user,
    schema.userSchema,
    schema.defaultValidationOptions,
  );

  validatedUser.password = await utils.hashPassword(validatedUser.password);
  validatedUser.club = validatedUser.club;

  const newUser = await usersQueries.addUser(dbConn, validatedUser);
  logger.info(
    `Inserted Super User:\n\tname(email): ${newUser.name}(${newUser.email}),\n\trole: ${
      newUser.role
    }\n\tdisabled: ${newUser.disabled}`,
  );
}

const init = async (dbConn) => {
  try {
    logger.info('... checking for super-user');
    const users = await usersQueries.getAllUsers(dbConn);
    if (users && users.length > 0) {
      logger.info('... There are some users already in the database, super-user was not added!');
      return;
    }
    await addSuperUser(dbConn);
    return;
  } catch (error) {
    logger.error({ message: '... Error caught when trying to run super-user init', error });
  }
};

export default init;
