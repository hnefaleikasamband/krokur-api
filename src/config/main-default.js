/**
 * Default config file.
 * This file should be renamed to main.js and values
 * changed appropriately.
 * @version 2018.10.28
 */
export default {
  port: process.env.PORT || 3000,
  database: process.env.MONGO_URI || 'mongodb://pathToDb:port/databaseName',
  secret: process.env.JWT_SECRET || 'YourSuperDuperAmazingSecret',
};
