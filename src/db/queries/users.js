const findUserByEmail = (db, email) => db.any('SELECT * FROM users where email = ${email}', { email });

const findUserById = (db, id) => db.any('SELECT * FROM users where id = ${id}', { id });

const getAllUsers = async db => db.any('SELECT id, email, name, club, role, disabled from users');

const addUser = async (db, user) => db.one(
  'INSERT INTO '
      + 'users(email, password, name, role, club, disabled )'
      + 'VALUES(${email}, ${password}, ${name}, ${role}, ${club}, ${disabled})'
      + 'RETURNING *',
  user,
);

const udpatePassword = async (db, id, password) => db.one('UPDATE users set password = ${password} where id = ${id} returning *', {
  id,
  password,
});

export default {
  findUserByEmail,
  findUserById,
  getAllUsers,
  addUser,
  udpatePassword,
};
