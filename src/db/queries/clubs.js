const findClubById = (db, id) => db.any('SELECT * FROM clubs where id = ${id}', { id });

const findClubByShorthand = (db, shorthand) => db.any('SELECT * FROM clubs where shorthand = ${shorthand}', { shorthand });

const getAllClubs = async db => db.any('SELECT * FROM clubs');

const addClub = async (db, club) => db.one('INSERT INTO clubs(name, shorthand) VALUES(${name}, ${shorthand}) RETURNING *', club);

const updateClub = async (db, club) => db.one(
  'UPDATE clubs SET name = ${name}, shorthand = ${shorthand} WHERE id = ${id} RETURNING *',
  club,
);

const removeClub = (db, id) => db.result('DELETE FROM clubs WHERE id = ${id}', { id }, r => r.rowCount === 1);

export default {
  findClubById,
  findClubByShorthand,
  getAllClubs,
  addClub,
  updateClub,
  removeClub,
};
