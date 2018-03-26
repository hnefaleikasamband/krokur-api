/**
 * @version 2018.03.25
 */

 import passport from "passport";
 import User from "../models/user";
 import config from "./main";
 import {Strategy as JwtStrategy} from 'passport-jwt';
 import {ExtractJwt} from 'passport-jwt';
 import LocalStrategy from "passport-local";

 const localOptions = {
     usernameField: "email"
 }
 const jwtOptions = {
     jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
     secretOrKey: config.secret
 };

 // Login strategy
 const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
        if(err) { return done(err); }
        if(!user) { return done(null, false, { error: "Your login details could not be verified"}); }

        user.comparePassword(password, (err, isMatch) => {
            if(err) { return done(err); }
            if(!isMatch) { return done(null, false, { error: "Your login details could not be verified"}); }

            user.DTO(userDTO => {
                return done(null, userDTO);
            })
            
        });
    });
 });

 // JWT authentication
 const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
    console.log("Payload in JWT strategy: ", payload);
     User.findById(payload._id, (err, user) => {
        if(err) { return done(err, false) }

        if(user) {
            done(null, user);
        } else {
            done(null, false);
        }
     });
 } );

 passport.use(jwtLogin);
 passport.use(localLogin);