import pgPromise from 'pg-promise';
import config from '../config/main';
import logger from '../config/logger';

const pgp = pgPromise();

const db = (connectionString = config.database) => {
  const database = pgp({ connectionString, ssl: true });
  // Test if db connection works
  database
    .connect()
    .then((connection) => {
      connection.done();
    })
    .catch(err => logger.error(err));
  return database;
};

export default db;
