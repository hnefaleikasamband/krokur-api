import jwt from 'jsonwebtoken';
import { uid } from 'rand-token';
import config from '../config/main';
import { usersQueries, clubsQueries } from '../db/index';
import logger from '../config/logger';
// To be able to run async/await
import '@babel/polyfill';

const refreshTokenDumbCache = {};

function generateToken(user) {
  return jwt.sign(user, config.secret, { expiresIn: '180m' });
  // Used while trying out timeouts.
  // return jwt.sign(user, config.secret, { expiresIn: '2m' });
}

async function setUserInfo(db, user) {
  let club;
  try {
    club = user.club ? (await clubsQueries.findClubById(db, user.club))[0] : null;
  } catch (error) {
    logger.error('Error fetching club in setUserInfo:', error);
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
  const refreshToken = uid(256);
  refreshTokenDumbCache[refreshToken] = {
    userId: userInfo.id,
    ttl: 10800,
    createdAt: new Date().getTime(),
  };
  res.status(200).json({
    token: `${generateToken(userInfo)}`,
    refreshToken,
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

export const refreshToken = async (req, res) => {
  const {
    body: { refreshToken: RT },
  } = req;
  if (RT && refreshTokenDumbCache[RT]) {
    const userTokenData = refreshTokenDumbCache[RT];
    // refreshToken has expired
    if (userTokenData.createdAt + userTokenData.ttl < new Date().getTime()) {
      delete refreshTokenDumbCache[RT];
      return res.status(401).send();
    }
    const userInfo = await usersQueries.findUserById(
      req.db,
      userTokenData.userId,
    );
    const token = generateToken(setUserInfo(userInfo));
    return res.status(200).json({
      token,
      userInfo,
    });
  }
  return res.status(401).send();
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

    res.status(401).send('Unauthorized');
    return next('Unauthorized');
  } catch (error) {
    logger.error(`Access check fail for user: ${user.id}`, error);
    return next('Unauthorized');
  }
};
