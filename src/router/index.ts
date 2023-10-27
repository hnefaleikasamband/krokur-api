import * as Router from "express";
import * as passport from "passport";
import "../config/passport";
import {
  login,
  redirectLogin,
  restrictAccessTo,
  authedUser,
} from "./authentication";
import users from "./users";
import athletes from "./athletes";
import club from "./clubs";
import match from "./matches";
import utils from "../services/utils";
import config from "../config/main";

// Middleware for login and auth
const requireAuth = passport.authenticate("jwt", { session: false });

export default function (app) {
  app.use(passport.initialize());
  const apiRoutes = new Router();

  const { ADMIN, COACH } = utils.ROLES;

  /**
   * Auth
   */
  apiRoutes.post(
    "/auth/login",
    passport.authenticate("local", { session: false }),
    login
  );

  apiRoutes.get("/auth/google", (req, res, next) => {
    const { id } = req.query;
    const state = id ? Buffer.from(id).toString("base64") : undefined;
    const authenticator = passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
      state,
    });
    authenticator(req, res, next);
  });

  apiRoutes.get(
    "/auth/google/redirect",
    passport.authenticate("google", {
      failureRedirect: `${config.krokurWeb}/login`,
    }),
    redirectLogin
  );
  apiRoutes.get("/auth/user", requireAuth, authedUser);

  /**
   * Users
   */
  apiRoutes.get(
    "/users",
    requireAuth,
    restrictAccessTo([ADMIN]),
    users.getUsers
  );
  apiRoutes.post(
    "/users",
    requireAuth,
    restrictAccessTo([ADMIN]),
    users.register
  );
  apiRoutes.put(
    "/users/:id/password",
    requireAuth,
    restrictAccessTo([ADMIN]),
    users.updatePassword
  );
  apiRoutes.put(
    "/users/:id/disable",
    requireAuth,
    restrictAccessTo([ADMIN]),
    users.setDisabledValue
  );
  apiRoutes.put(
    "/users/:id",
    requireAuth,
    restrictAccessTo([ADMIN]),
    users.updateUser
  );

  /**
   * Athletes
   */
  apiRoutes.get(
    "/athletes/manage-view",
    requireAuth,
    restrictAccessTo([ADMIN, COACH]),
    athletes.getAllAthletesDetailed
  );
  apiRoutes.get(
    "/athletes/:athleteId/bouts",
    requireAuth,
    athletes.getMatchesForAthlete
  );
  apiRoutes.get("/athletes/:id?", requireAuth, athletes.getSingleOrAllAthletes);
  apiRoutes.post(
    "/athletes",
    requireAuth,
    restrictAccessTo([ADMIN, COACH]),
    athletes.createAthlete
  );
  apiRoutes.put(
    "/athletes/:id",
    requireAuth,
    restrictAccessTo([ADMIN, COACH]),
    athletes.updateAthlete
  );
  apiRoutes.post(
    "/athletes/:athleteId/bouts",
    requireAuth,
    athletes.addMatchForSingleAthlete
  );
  apiRoutes.post(
    "/athletes/:athleteId/recalculate",
    requireAuth,
    restrictAccessTo([ADMIN]),
    athletes.recalculateAthleteAchievement
  );

  /**
   * Clubs
   */
  apiRoutes.get("/clubs/:shorthand?", requireAuth, club.getClubData);
  apiRoutes.post("/clubs", requireAuth, club.addClub);
  apiRoutes.put("/clubs/:id", requireAuth, club.updateClub);

  /**
   * Matches
   */
  apiRoutes.get("/match/:id", requireAuth, match.getMatch);
  apiRoutes.post("/match", requireAuth, match.addCompleteMatch);

  app.use("/v1", apiRoutes);
  app.get("/health-check", (req, res) => res.json({ message: "I'm healthy" }));
}
