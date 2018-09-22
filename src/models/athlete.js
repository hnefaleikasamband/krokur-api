import mongoose from 'mongoose';
import kt from 'kennitala';
import Club from './club';

const { Schema } = mongoose;

const AthleteSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      validate: {
        validator() {
          return this.name.length > 5;
        },
        message: 'Name needs to be atleast 5 characters',
      },
    },
    ssn: {
      type: String,
      require: true,
      // Notice, unique is not a validator, it only creates indexes.
      unique: true,
      validate: {
        validator(ssn) {
          return kt.isValid(ssn) && kt.isPerson(ssn);
        },
        message: 'Not a valid SSN',
      },
    },
    club: {
      type: String,
      validate(club) {
        return new Promise((resolve) => {
          Club.find({ shorthand: club.toUpperCase() }).exec((err, clubs) => {
            let valid = false;
            if (clubs && clubs.length > 0) {
              valid = true;
            }
            resolve(valid);
          });
        });
      },
      message: 'Club not found',
    },
    achievements: {
      diploma: {
        date: Date,
        boutsLeft: {
          type: Number,
          default: 0,
        },
      },
      bronz: {
        date: Date,
        boutsLeft: {
          type: Number,
          default: 4,
        },
      },
      silver: {
        date: Date,
        boutsLeft: {
          type: Number,
          default: 4,
        },
      },
      gold: {
        date: Date,
        boutsLeft: {
          type: Number,
          default: 4,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Athlete', AthleteSchema);
