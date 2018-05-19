import mongoose from "mongoose";
import kt from "kennitala";

// TODO: change import to import { Schema } from "mongoose";
const Schema = mongoose.Schema;


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
        unique: true,
        validate: {
            validator: function(ssn) {
                console.log("Validating KT ----:", ssn);
                return kt.isValid(ssn) && kt.isPerson();
            },
            message: 'Not a valid SSN'
        }
    },
    club: {
        type: String
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

//AthleteSchema.index({'': ''})

export default mongoose.model("Athlete", AthleteSchema);