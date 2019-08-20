import bcrypt from 'bcryptjs';
import { achievementsQueries } from '../db/index';

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
const dreamCatcher = route => async (req, res) => {
  try {
    return await route(req, res);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.log(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const calculateAchievement = (boutsLeft, date) => (boutsLeft <= 0 ? { date, boutsLeft } : { date: null, boutsLeft: parseInt(boutsLeft, 10) - 1 });

const achievementCheck = (data) => {
  const response = { needsToUpdate: true, updateAchievement: null, achievementName: '' };

  if (data.points < 27) {
    return { ...response, needsToUpdate: false };
  }
  const {
    athleteId,
    diploma_date: diplomaDate,
    diploma_bouts_left: diplomaBoutsLeft,
    bronz_date: bronzDate,
    bronz_bouts_left: bronzBoutsLeft,
    silver_date: silverDate,
    silver_bouts_left: silverBoutsLeft,
    gold_date: goldDate,
    gold_bouts_left: goldBoutsLeft,
    points,
    date,
  } = data;
  let updateAchievement;
  if (!diplomaDate) {
    updateAchievement = calculateAchievement(diplomaBoutsLeft, date);
    response.updateAchievement = achievementsQueries.updateDiploma(updateAchievement);
    response.achievementName = 'diploma';
  } else if (!bronzDate) {
    updateAchievement = calculateAchievement(bronzBoutsLeft, date);
    response.updateAchievement = achievementsQueries.updateBronz(updateAchievement);
    response.achievementName = 'bronz';
  } else if (points >= 31 && !silverDate) {
    updateAchievement = calculateAchievement(silverBoutsLeft, date);
    response.updateAchievement = achievementsQueries.updateSilver(updateAchievement);
    response.achievementName = 'silver';
  } else if (points >= 35 && !goldDate) {
    updateAchievement = calculateAchievement(goldBoutsLeft, date);
    response.updateAchievement = achievementsQueries.updateGold(updateAchievement);
    response.achievementName = 'gold';
  } else {
    response.needsToUpdate = false;
  }
  console.log(
    ` <Achievement-Process> ... Athlete: ${athleteId} update: ${JSON.stringify(
      updateAchievement,
    )} for achievement: ${response.achievementName}`,
  );
  return response;
};

const snakeToCamelCase = snek => snek.replace(/(_\w)/g, big => big[1].toUpperCase());

const mapDbObjectToResponse = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => mapDbObjectToResponse(v));
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
  achievementCheck,
  snakeToCamelCase,
  mapDbObjectToResponse,
};
