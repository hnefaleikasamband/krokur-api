import bcrypt from 'bcryptjs';
import { achievementsQueries, boutsQueries } from '../db/index';
import logger from '../config/logger';

const hashPassword = async (password) => {
  const SALT_FACTOR = 12;
  const salt = await bcrypt.genSalt(SALT_FACTOR);
  return bcrypt.hash(password, salt);
};

const ROLES = {
  ADMIN: 'ADMIN',
  COACH: 'COACH',
  JUDGE: 'JUDGE',
};

/** Async/Await error handler for consistent error handling */
const dreamCatcher = (route) => async (req, res) => {
  try {
    return await route(req, res);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.details[0].message || err.message });
    }
    logger.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const BASE_ACHIEVEMENT = {
  athleteId: undefined,
  diplomaDate: undefined,
  diplomaBoutsLeft: 0,
  bronzDate: undefined,
  bronzBoutsLeft: 4,
  silverDate: undefined,
  silverBoutsLeft: 4,
  goldDate: undefined,
  goldBoutsLeft: 4,
};

const newAchievementOrBoutsLeft = (date) => (boutsLeft) => (boutsLeft <= 0
  ? { date, boutsLeft }
  : { date: null, boutsLeft: parseInt(boutsLeft, 10) - 1 });

/**
 * Does checks to see if any of the achievements should be updated
 */
const validateAchievement = (achievementStatus, { points, bout_date: matchDate }) => {
  if (points < 27) return achievementStatus;
  const newStatus = achievementStatus;
  const achievementCheck = newAchievementOrBoutsLeft(matchDate);
  if (!achievementStatus.diplomaDate) {
    const { date, boutsLeft } = achievementCheck(achievementStatus.diplomaBoutsLeft);
    newStatus.diplomaDate = date;
    newStatus.diplomaBoutsLeft = boutsLeft;
  } else if (!achievementStatus.bronzDate) {
    const { date, boutsLeft } = achievementCheck(achievementStatus.bronzBoutsLeft);
    newStatus.bronzDate = date;
    newStatus.bronzBoutsLeft = boutsLeft;
  } else if (points >= 31 && !achievementStatus.silverDate) {
    const { date, boutsLeft } = achievementCheck(achievementStatus.silverBoutsLeft);
    newStatus.silverDate = date;
    newStatus.silverBoutsLeft = boutsLeft;
  } else if (points >= 35 && !achievementStatus.goldDate) {
    const { date, boutsLeft } = achievementCheck(achievementStatus.goldBoutsLeft);
    newStatus.goldDate = date;
    newStatus.goldBoutsLeft = boutsLeft;
  }

  return newStatus;
};

const recalculateAndUpdateAchievements = async (db, athleteId) => {
  try {
    const allMatches = await boutsQueries.getAllBoutsForAthlete(db, athleteId, 'asc');
    const achievementUpdate = allMatches.reduce(
      (achievementStatus, match) => {
        const newAchievementStatus = validateAchievement(achievementStatus, match);
        return newAchievementStatus;
      },
      { ...BASE_ACHIEVEMENT },
    );
    return achievementsQueries.updateAchievements(db, athleteId, achievementUpdate);
  } catch (error) {
    logger.fatal(`Could not update achievements for athlete: ${athleteId}`, error);
    return Promise.reject(error);
  }
};

const snakeToCamelCase = (snek) => snek.replace(/(_\w)/g, (big) => big[1].toUpperCase());

const mapDbObjectToResponse = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => mapDbObjectToResponse(v));
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeToCamelCase(key)]: mapDbObjectToResponse(obj[key]),
      }),
      {},
    );
  }
  return obj;
};

export default {
  hashPassword,
  ROLES,
  dreamCatcher,
  recalculateAndUpdateAchievements,
  snakeToCamelCase,
  mapDbObjectToResponse,
};
