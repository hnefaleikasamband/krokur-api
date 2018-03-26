/**
 * Default config file.
 * This file should be renamed to main.js and values
 * changed appropriately.
 * @version 2018.03.25
 */
export default {
    'port': process.env.PORT || 3000,
    'database': 'mongodb://pathToDb:port/databaseName',
    'secret': 'YourSuperDuperAmazingSsecret'
};