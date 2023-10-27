import * as jwt from "jsonwebtoken";
import config from "../config/main";
import { usersQueries, clubsQueries } from "../db/index";
import logger from "../config/logger";

function generateToken(user) {
  return jwt.sign(user, config.secret, { expiresIn: "180m" });
  // Used while trying out timeouts.
  // return jwt.sign(user, config.secret, { expiresIn: '2m' });
}

async function setUserInfo(db, user) {
  let club;
  try {
    club = user.club
      ? (await clubsQueries.findClubById(db, user.club))[0]
      : null;
  } catch (error) {
    logger.error("Error fetching club in setUserInfo:", error);
    club = null;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    club,
  };
}

export const login = async (req, res) => {
  const userInfo = await setUserInfo(req.db, req.user);
  res.status(200).json({
    token: `${generateToken(userInfo)}`,
    userInfo,
    expiresIn: 10800,
  });
};

export const redirectLogin = async (req, res) => {
  const userInfo = await setUserInfo(req.db, req.user);
  const { nextRoute } = req.authInfo;
  const token = generateToken(userInfo);
  if (nextRoute) return res.redirect(`${nextRoute}?p=${token}`);
  return res.redirect(`${config.krokurWeb}/dashboard?p=${token}`);
};

export const authedUser = async (req, res) => {
  if (!req.user || req.user === undefined) {
    return res.status(401).send();
  }
  const { iat, exp, ...user } = req.user;
  return res.json(user);
};

// ========================================
// Authorization Middleware
// ========================================

// Role authorization check
export const restrictAccessTo = (roles) => async (req, res, next) => {
  const { user } = req;
  try {
    const currentUser = await usersQueries.findUserById(req.db, user.id);
    // If user is found, check role.
    if (roles.includes(currentUser[0].role)) {
      return next();
    }

    res.status(401).send("Unauthorized");
    return next("Unauthorized");
  } catch (error) {
    logger.error(`Access check fail for user: ${user.id}`, error);
    return next("Unauthorized");
  }
};
