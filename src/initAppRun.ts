import { usersQueries, clubsQueries, athletesQueries } from './db/index';
import schema from './db/schemas';
import utils from './services/utils';
import logger from './config/logger';

const ATHLETE_ORGANIZATION = {
  name: 'Hnefaleikasamband Íslands',
  shorthand: 'HNÍ',
};

async function addSuperUser(dbConn) {
  const user = {
    email: 'admin@admin.is',
    password: 'admin',
    confirmPassword: 'admin',
    name: 'Administrator',
    disabled: 'false',
    role: 'ADMIN',
    club: null,
  };

  const validatedUser = await schema.userSchema.validateAsync(
    user,
    schema.defaultValidationOptions,
  );

  validatedUser.password = await utils.hashPassword(validatedUser.password);

  const newUser = await usersQueries.addUser(dbConn, validatedUser);
  logger.info(
    `Inserted Super User -> name(email): ${newUser.name}(${newUser.email}), role: ${newUser.role} disabled: ${newUser.disabled}`,
  );
}

async function addOrgClub(dbConn) {
  const validatedClub = await schema.clubSchema.validateAsync(
    ATHLETE_ORGANIZATION,
    schema.defaultValidationOptions,
  );

  const newClub = await clubsQueries.addClub(dbConn, validatedClub);
  logger.info(
    `Inserted Organization as Club -> name(shorthand): ${newClub.name}(${newClub.shorthand})`,
  );
  return newClub;
}

async function addAnonAthlete(dbConn, club) {
  const athlete = {
    name: 'Anonymous',
    ssn: '0000000000',
    club: club.id,
  };

  const validatedAthlete = await schema.athleteSchema.validateAsync(
    athlete,
    schema.defaultValidationOptions,
  );

  logger.info(validatedAthlete);

  const newAthlete = await athletesQueries.addAthlete(dbConn, validatedAthlete);
  logger.info(
    `Inserted Anonymous athlete -> name: ${newAthlete.name}, ssn: ${newAthlete.ssn} club: ${club.shorthand}`,
  );
}

const init = async (dbConn) => {
  try {
    logger.info('... Init checks starting');
    const usersQuery = usersQueries.getAllUsers(dbConn);
    const clubsQuery = clubsQueries.getAllClubs(dbConn);
    const anonExistsQuery = athletesQueries.athleteExists(dbConn, '0000000000');
    const [users, clubs, anonExists] = await Promise.all([
      usersQuery,
      clubsQuery,
      anonExistsQuery,
    ]);

    if (!anonExists) {
      const athleteOrgExists = clubs.find(
        (c) => c.shorthand === ATHLETE_ORGANIZATION.shorthand,
      );
      logger.info(athleteOrgExists);
      const athleteOrg = athleteOrgExists || (await addOrgClub(dbConn));
      await addAnonAthlete(dbConn, athleteOrg);
    } else {
      logger.info(
        '... Anon user & Athlete Org already registered, no action needed!',
      );
    }

    if (users && users.length > 0) {
      logger.info(
        '... There are some users already in the database, super-user was not added!',
      );
      return;
    }

    await addSuperUser(dbConn);
    return;
  } catch (error) {
    logger.error({
      message: '... Error caught when trying to run super-user init',
    });
    logger.error(error);
  }
};

export default init;
