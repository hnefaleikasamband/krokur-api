const findUser = (db, email) => db.one('SELECT * FROM users where email = ${email}', email);

const addUser = (db, user) => {
  return db.one(
    'INSERT INTO ' +
      'users(email, password, name, role)' +
      'VALUES(${email}, ${password}, ${name}, ${role})' +
      'RETURNING *',
      user
  );

export default { findUser, addUser };
