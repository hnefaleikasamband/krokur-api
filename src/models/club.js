import mongoose from "mongoose";

// TODO: change import to import { Schema } from "mongoose";
const Schema = mongoose.Schema;

const ClubSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    shorthand: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function () {
                return this.shorthand.length <= 5;
            },
            message: 'Shorthand can not be longer than 5 characters'
        }
    },
    info: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

ClubSchema.pre("save", function (next) {
    const club = this;
    club.shorthand = club.shorthand.toUpperCase();
    next();
});

export default mongoose.model('Club', ClubSchema);