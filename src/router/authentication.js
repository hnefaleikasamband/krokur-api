/**
 * @version 2018.03.25
 */

import jwt from "jsonwebtoken";
import config from "../config/main";
import User from "../models/user";

function generateToken(user)  {
    return jwt.sign(user, config.secret, { expiresIn: 10800 });
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
// Login Route
//========================================
exports.login = function (req, res, next) {

    let userInfo = setUserInfo(req.user);

    res.status(200).json({
        token: "JWT " + generateToken(userInfo),
        user: userInfo
    });
};


//========================================
// Registration Route
//========================================
exports.register = function (req, res, next) {
    // Check for registration errors
    const email = req.body.email;
    const name = req.body.name
    const password = req.body.password;
    const access = req.body.access;

    // Return error if no email provided
    if (!email) {
        return res.status(422).send({error: "You must enter an email address."});
    }

    // Return error if full name not provided
    if (!name || !name.length) {
        return res.status(422).json({ error: "Missing name." });
    }

    // Return error if no password provided
    if (!password) {
        return res.status(422).send({error: "You must enter a password."});
    }

    User.findOne({ email: email }, function (err, existingUser) {
        if (err) {return next(err);}

        // If user is not unique, return error
        if (existingUser) {
            return res.status(422).send({error: "That email address is already in use."});
        }

        // If email is unique and password was provided, create account
        let user = new User({
            email: email,
            password: password,
            name: name
        });

        if(access) {
            user.access = access.toLowerCase();
        }

        user.save(function (err, user) {
            if (err) { return next(err); }

            // Subscribe member to Mailchimp list
            // mailchimp.subscribeToNewsletter(user.email);

            // Respond with JWT if user was created

            let userInfo = setUserInfo(user);

            res.status(201).json({
                token: "JWT " + generateToken(userInfo),
                user: userInfo
            });
        });
    });
};

//========================================
// Authorization Middleware
//========================================

const accessAvailable = {
    "read": 0,
    "write": 1,
    "admin": 2,
    "superadmin": 3
};

// Role authorization check
exports.hasAccess = function(access) {  
    return function(req, res, next) {
        const user = req.user;

        User.findById(user._id, function(err, foundUser) {
        if (err) {
            res.status(422).json({ error: 'No user was found.' });
            return next(err);
        }

        // If user is found, check role.
        if (accessAvailable[foundUser.access] >= accessAvailable[access]) {
            return next();
        }

        res.status(401).json({ error: 'You are not authorized to view this content.' });
        return next('Unauthorized');
      })
    }
  }