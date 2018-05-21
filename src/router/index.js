/**
 * This is the main routing file, declaring all top
 * level routes as well as authentication.
 * @version 2018.03.25
 */
import Router from "express";
import passportService from "../config/passport";
import passport from "passport";
import AuthAccess from "./authentication";
import athletes from "./athletes";
import bouts from "./bouts";
import club from "./clubs";


// Middleware for login and auth
const requireAuth = passport.authenticate("jwt", {session: false});
const requireLogin = passport.authenticate("local", {session: false});

// Access constants
const REQUIRE = {
    READ: "read",
    WRITE: "write",
    ADMIN: "admin",
    SUPERADMIN: "superadmin"
};


export default function (app) {
    const apiRoutes = new Router();
    const authRoutes = new Router();

    apiRoutes.use("/athletes", athletes);
    apiRoutes.use("/bouts", bouts);
    apiRoutes.use("/clubs", club);
    apiRoutes.use("/auth", authRoutes);

    authRoutes.post("/register", AuthAccess.register);
    authRoutes.post("/login", requireLogin, AuthAccess.login);

    apiRoutes.get("/", requireAuth, (req, res, next) => {
        res.json({success: true})
    })

    app.use("/api/v1", apiRoutes);
    app.use("/", authRoutes);
};