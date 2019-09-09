import pgPromise from 'pg-promise';

const getAchievementsById = async (db, athleteId) => db.any(
  'SELECT A.id, A.name, A.ssn, AC.diploma_date, AC.diploma_bouts_left, AC.bronz_date, AC.bronz_bouts_left, '
      + 'AC.silver_date, AC.silver_bouts_left, AC.gold_date, AC.gold_bouts_left '
      + 'FROM Achievements AC INNER JOIN athletes A ON AC.athleteId = A.id'
      + 'where AC.athlete_id = ${athleteId};',
  { athleteId },
);

const startAchievements = async (db, athleteId) => db.any('INSERT INTO achievements (athlete_id) VALUES(${athleteId}) RETURNING *;', { athleteId });

const getAchievementStatus = async (db, athleteId) => db.any(
  'SELECT diploma_date, diploma_bouts_left, bronz_date, bronz_bouts_left, silver_date, silver_bouts_left, gold_date, gold_bouts_left '
      + 'FROM achievements where athlete_id = ${athleteId};',
  { athleteId },
);

const updateDiploma = data => async (db, athleteId) => db.one(
  'UPDATE achievements SET diploma_date = ${date}, diploma_bouts_left = ${boutsLeft} WHERE athlete_id = ${athleteId} RETURNING *',
  { ...data, athleteId },
);
const updateBronz = data => async (db, athleteId) => db.one(
  'UPDATE achievements SET bronz_date = ${date}, bronz_bouts_left = ${boutsLeft} WHERE athlete_id = ${athleteId} RETURNING *',
  { ...data, athleteId },
);
const updateSilver = data => async (db, athleteId) => db.one(
  'UPDATE achievements SET silver_date = ${date}, silver_bouts_left = ${boutsLeft} WHERE athlete_id = ${athleteId} RETURNING *',
  { ...data, athleteId },
);
const updateGold = data => async (db, athleteId) => db.one(
  'UPDATE achievements SET gold_date = ${date}, gold_bouts_left = ${boutsLeft} WHERE athlete_id = ${athleteId} RETURNING *',
  { ...data, athleteId },
);

const updateAchievements = async (db, athleteId, achievements) => db.one(
  'UPDATE achievements SET diploma_date = ${diplomaDate}, diploma_bouts_left = ${diplomaBoutsLeft}, '
      + 'bronz_date = ${bronzDate}, bronz_bouts_left = ${bronzBoutsLeft}, '
      + 'silver_date = ${silverDate}, silver_bouts_left = ${silverBoutsLeft}, '
      + 'gold_date = ${goldDate}, gold_bouts_left = ${goldBoutsLeft} '
      + 'WHERE athlete_id = ${athleteId} RETURNING *',
  {
    ...achievements,
    athleteId,
  },
);

export default {
  getAchievementsById,
  startAchievements,
  getAchievementStatus,
  updateDiploma,
  updateBronz,
  updateSilver,
  updateGold,
  updateAchievements,
};
