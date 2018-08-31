/**
 * @version 2018.03.25
 */

import jwt from "jsonwebtoken";
import config from "../config/main";
import User from "../models/user";
// To be able to run async/await
import "babel-polyfill";

function generateToken(user) {
  return jwt.sign(user, config.secret, { expiresIn: "180m" });
  // Used while trying out timeouts.
  //return jwt.sign(user, config.secret, { expiresIn: '2m' });
}

function setUserInfo(request) {
  return {
    _id: request._id,
    name: request.name,
    email: request.email,
    access: request.access
  };
}

//========================================
// Login Route, this fn is only called if
// the passport un/pw login is successful.
//========================================
exports.login = function(req, res, next) {
  let userInfo = setUserInfo(req.user);

  res.status(200).json({
    token: "JWT " + generateToken(userInfo),
    // TODO: Revisit this and decide if we want to decode JWT in frontend or send like this.
    user: {
      name: userInfo.name,
      email: userInfo.email,
      access: userInfo.access
    },
    expiresIn: 10800
  });
};

//========================================
// Return the User who owns the JWT token
//========================================
exports.authedUser = function(req, res, next) {
  let userInfo = setUserInfo(req.user);
  if (!req.user || req.user === undefined) {
  }
  res.status(200).json(userInfo);
};

//========================================
// Registration Route
//========================================
exports.register = async function(req, res, next) {
  // Check for registration errors
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const access = req.body.access;
  const club = req.body.club;

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .send({ error: "User with that email already exists" });
    }
    // TODO: Should this check be here, if coaches are added and no club assigned error.
    /*
        if((access && access.toLowerCase() === 'read') && (!club || club === '')) {
            return 
        }*/

    let user = new User({
      email: email,
      name: name,
      password: password,
      access: access,
      club: club
    });

    await user.validate();
    await user.save();
    let userInfo = setUserInfo(user);
    res.status(201).json({
      token: "JWT " + generateToken(userInfo),
      user: userInfo
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    } else {
      // FIXME: This needs to be logged properly!!
      console.log("Error saving user:", error);
      return res
        .status(500)
        .json({ error: "Error saving user, check logs for details" });
    }
  }
};

//========================================
// Authorization Middleware
//========================================

const accessAvailable = {
  read: 0,
  write: 1,
  admin: 2,
  superadmin: 3
};

// Role authorization check
exports.hasAccess = function(access) {
  return function(req, res, next) {
    const user = req.user;

    User.findById(user._id, function(err, foundUser) {
      if (err) {
        res.status(422).json({ error: "No user was found." });
        return next(err);
      }

      // If user is found, check role.
      if (accessAvailable[foundUser.access] >= accessAvailable[access]) {
        return next();
      }

      res
        .status(401)
        .json({ error: "You are not authorized to view this content." });
      return next("Unauthorized");
    });
  };
};

//========================================
// List Users
//========================================
exports.getUsers = async function(req, res, next) {
  try {
    // TODO: We will need to clean up this data before sending it (e.g. passwords)
    const users = await User.find({});

    res.status(201).json({
      users
    });
  } catch (error) {
    // FIXME: This needs to be logged properly!!
    console.log("Error fetching users from database:", error);
    return res
      .status(500)
      .json({ error: "Error fetching users from database" });
  }
};
