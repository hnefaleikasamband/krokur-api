import mongoose from "mongoose";
import kt from "kennitala";

// TODO: change import to import { Schema } from "mongoose";
const Schema = mongoose.Schema;
import Club from "./club";


const AthleteSchema = new Schema({
    name: {
        type: String,
        require: true,
        validate: {
            validator: function() {
                return this.name.length > 5;
            },
            message: 'Name needs to be atleast 5 characters'
        }
    },
    ssn: {
        type: String,
        require: true,
        // Notice, unique is not a validator, it only creates indexes.
        unique: true,
        validate: {
            validator: function(ssn) {
                return kt.isValid(ssn) && kt.isPerson(ssn);
            },
            message: 'Not a valid SSN'
        }
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
    achievements: {
        diploma: Date,
        bronz: Date,
        silver: Date,
        gold: Date
}
}, {
    timestamps: true
});

export default mongoose.model("Athlete", AthleteSchema);