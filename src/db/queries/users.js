const findUser = (db, email) => db.one('SELECT * FROM users where email = ${email}', email);

export default { findUser };
