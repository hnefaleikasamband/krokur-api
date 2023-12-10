import * as express from "express";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import PostgresDB from "./services/postgres";
import config from "./config/main";
import router from "./router/index";
import checkSuperUser from "./initAppRun";
import logger from "./config/logger";

try {
  (async () => {
    const app = express();
    app.set("trust proxy", true);
    const logLevel = process.env.LOGGING === "production" ? "combined" : "dev";
    app.use(morgan(logLevel)); // Using morgan for logging express requests
    app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
    // middleware that only parses json, only if the content-type matches.
    app.use(bodyParser.json());

    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, GET, POST, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
      );
      res.header("Access-Control-Allow-Credentials", "true");

      // intercept and end a preflight OPTIONS request
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    const db = PostgresDB();
    await checkSuperUser(db);
    const dbMiddleWare = (req, res, next) => {
      req.db = db;
      next();
    };

    app.use(dbMiddleWare);

    app.listen(config.port, () => {
      logger.info(`Server is running on port: ${config.port}`);
    });

    router(app);
  })();
} catch (error) {
  logger.error(error);
  process.exit();
}

process.on("SIGINT", () => {
  process.exit();
});
