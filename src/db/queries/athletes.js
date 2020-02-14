/* eslint-disable no-template-curly-in-string */
const findAthleteById = async (db, id) => db.any(
  'SELECT A.id, A.name, A.ssn, C.name as club, C.shorthand as club_shorthand, AC.diploma_date, AC.diploma_bouts_left, AC.bronz_date, '
      + 'AC.bronz_bouts_left, AC.silver_date, AC.silver_bouts_left, AC.gold_date, AC.gold_bouts_left '
      + 'FROM Athletes A INNER JOIN clubs C ON A.club = C.id INNER JOIN achievements AC ON A.id = AC.athlete_id '
      + 'where A.id = ${id};',
  { id },
);

const athleteExists = async (db, ssn) => (await db.any('SELECT * FROM athletes where ssn = ${ssn}', { ssn })).length > 0;

const getAllAthletes = async db => db.any(
  'SELECT A.id, A.name, C.shorthand as club, AC.diploma_date, AC.bronz_date, AC.silver_date, AC.gold_date '
      + 'FROM Athletes A INNER JOIN clubs C ON A.club = C.id INNER JOIN achievements AC ON A.id = AC.athlete_id;',
);

const getDetailedAllAthletes = async db => db.any(
  'SELECT A.id, A.name, A.ssn, C.shorthand as club, AC.diploma_date, AC.bronz_date, AC.silver_date, AC.gold_date, '
      + 'AC.diploma_bouts_left, AC.bronz_bouts_left, AC.silver_bouts_left, AC.gold_bouts_left '
      + 'FROM Athletes A INNER JOIN clubs C ON A.club = C.id INNER JOIN achievements AC ON A.id = AC.athlete_id;',
);

const getDetailedAllAthletesByClub = async (db, clubId) => db.any(
  'SELECT A.id, A.name, A.ssn, C.shorthand as club, AC.diploma_date, AC.bronz_date, AC.silver_date, AC.gold_date, '
      + 'AC.diploma_bouts_left, AC.bronz_bouts_left, AC.silver_bouts_left, AC.gold_bouts_left '
      + 'FROM Athletes A INNER JOIN clubs C ON A.club = C.id INNER JOIN achievements AC ON A.id = AC.athlete_id '
      + 'where C.id = ${clubId};',
  { clubId },
);

// No joins in data
const getAthleteCleanBasicInfoById = async (db, id) => db.any('SELECT * FROM athletes where id = ${id}', { id });

const addAthlete = async (db, athlete) => db.one(
  'INSERT INTO athletes (ssn, name, club) VALUES(${ssn}, ${name}, ${club}) RETURNING *',
  athlete,
);

const updateAthlete = async (db, athlete) => db.one(
  'UPDATE athletes SET name = ${name}, ssn = ${ssn}, club = ${club} WHERE id = ${id} RETURNING *',
  athlete,
);

const removeAthlete = (db, id) => db.result('DELETE FROM athletes WHERE id = ${id}', { id }, r => r.rowCount === 1);

export default {
  findAthleteById,
  athleteExists,
  getAllAthletes,
  getAthleteCleanBasicInfoById,
  addAthlete,
  updateAthlete,
  removeAthlete,
  getDetailedAllAthletes,
  getDetailedAllAthletesByClub,
};
