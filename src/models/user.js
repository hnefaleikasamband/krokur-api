import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Club from "./club";

// TODO: change import to import { Schema } from "mongoose";
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        require: true,
        validate: {
            validator: function(email) {
                const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegex.test(email);
            },
            message: 'Email was not valid'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        message: 'Password must be at least 5 characters long'
    },
    name: {
        type: String,
        required: true,
    },
    access: {
        type: String,
        enum: ["read", "write", "admin", "superadmin"],
        default: "read"
    },
    club: {
        type: String,
        validate: function(club) {
            return new Promise( (resolve, reject) => {
                Club.find({shorthand: club.toUpperCase()})
                    .exec(function (err, clubs) {
                        let valid = false;
                        if (clubs && clubs.length > 0) {
                            valid = true;
                        }
                        resolve(valid);
                    });
            });
        },
        message: 'Club not found'
    },
    disabled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Pre-save function that hashes the password if it's new or modified before saving
UserSchema.pre("save", function (next) {
    const user = this;
    const SALT_FACTOR = 12;

    if( user.access ) user.access = user.access.toUpperCase();
    if( !user.isModified("password")) return next();

    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Comparing passwords

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

UserSchema.methods.DTO = function(cb) {
    const user = {
        _id: this._id,
        name: this.name,
        email: this.email
    }
    cb(user);
}

export default mongoose.model("User", UserSchema);