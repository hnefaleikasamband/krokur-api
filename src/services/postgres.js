import pgPromise from 'pg-promise';
import config from '../config/main';

const pgp = pgPromise();

const db = (connectionString = config.database) => {
  const database = pgp({ connectionString, ssl: true });
  // Test if db connection works
  database
    .connect()
    .then((connection) => {
      connection.done();
    })
    .catch(err => console.log(err));
  return database;
};

export default db;
