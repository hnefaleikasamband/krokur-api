import mongoose from "mongoose";

// TODO: change import to import { Schema } from "mongoose";
const Schema = mongoose.Schema;


const AthleteSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    kt: {
        type: String,
        require: true,
        unique: true
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