import mongoose from "mongoose";

// TODO: change import to import { Schema } from "mongoose";
const Schema = mongoose.Schema;


const BoutSchema = new Schema({
    athlete: {
        type: Schema.Types.ObjectId,
        ref: 'Athlete',
        required: true
    },
    opponent: {
        type: Schema.Types.ObjectId,
        ref: 'Athlete',
        required: true
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
    type: {
        type: String,
        enum: ["A", "B", "C"],
        required: true
    },
    date: Date,
    points: {
        type: Number,
        min: 9,
        max: 45,
        required: true
    },
    eventOrganizer: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

export default mongoose.model("Bout", BoutSchema);