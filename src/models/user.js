import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// TODO: change import to import { Schema } from "mongoose";
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        require: true
    },
    password: {
        type: String,
        required: true
    },
    name: {type: String},
    access: {
        type: String,
        enum: ["read", "write", "admin", "superadmin"],
        default: "read"
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