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
        type: String
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