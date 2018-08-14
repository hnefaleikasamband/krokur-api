/**
 * Setting up the API and database connection
 * @version 2018.03.24
 */
import mongoose from "mongoose";
import config from "./config/main";
import express from "express";
import log from "morgan";
import bodyParser from "body-parser";
import router from "./router/index";



// If we can't connect to the database we can't send any data back
// from requests so we only run the app when mongoose connects.

// Use native promises
mongoose.Promise = global.Promise;
mongoose.connect(config.database)
    .then( db => {
        // FIXME: Use Winston logging for messages like these.
        console.log("Connected to MongoDB");

        //Start the server
        const app = express();
        const server = app.listen(config.port);
        // FIXME: use winston
        console.log("Server is running on port: ", config.port);

        app.use(log("dev")); // Using morgan for logging express requests
        app.use(bodyParser.urlencoded({extended: false})) // Parses urlencoded bodies
        app.use(bodyParser.json()); // Send JSON responses

        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
            res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
            );
            res.header("Access-Control-Allow-Credentials", "true");

            // intercept and end a preflight OPTIONS request
            if ("OPTIONS" == req.method) {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        router(app);

    }, reason => {
        // FIXME: Winston logger
        console.log("There was an error connection to MongoDB: ", reason);
    });