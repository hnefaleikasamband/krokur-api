const findUserByEmail = (db, email) => db.any('SELECT * FROM users WHERE email = ${email}', { email });

const findUserById = (db, id) => db.any('SELECT * FROM users WHERE id = ${id}', { id });

const getAllUsers = async db => db.any('SELECT id, email, name, club, role, disabled from users');

const addUser = async (db, user) => db.one(
  'INSERT INTO '
      + 'users(email, password, name, role, club, disabled )'
      + 'VALUES(${email}, ${password}, ${name}, ${role}, ${club}, ${disabled})'
      + 'RETURNING *',
  user,
);

const udpatePassword = async (db, id, password) => db.one('UPDATE users SET password = ${password} WHERE id = ${id} RETURNING *', {
  id,
  password,
});

const updateUserWithoutPassword = async (db, user) => db.one(
  'UPDATE users SET email = ${email}, name = ${name}, club = ${club}, role = ${role}, disabled = ${disabled} WHERE id = ${id} RETURNING *',
  user,
);

const setDisabledValue = async (db, id, disabledValue) => db.one('UPDATE users SET disabled = ${disabledValue} WHERE id = ${id} RETURNING *', {
  id,
  disabledValue,
});

export default {
  findUserByEmail,
  findUserById,
  getAllUsers,
  addUser,
  udpatePassword,
  updateUserWithoutPassword,
  setDisabledValue,
};
