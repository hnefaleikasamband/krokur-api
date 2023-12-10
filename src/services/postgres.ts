import * as pgPromise from "pg-promise";
import config from "../config/main";
import logger from "../config/logger";

const pgp = pgPromise();

const db = (connectionString = config.database) => {
  const database = pgp({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  // Test if db connection works
  database
    .connect()
    .then((connection) => {
      connection.done();
    })
    .catch((err) => {
      logger.error(`could not connect to DB: ${err}`);
      logger.error(err);
    });
  return database;
};

export default db;
