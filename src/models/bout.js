import mongoose from 'mongoose';
import Club from './club';
import Athlete from './athlete';

const { Schema } = mongoose;

const BoutSchema = new Schema(
  {
    athlete: {
      type: Schema.Types.ObjectId,
      ref: 'Athlete',
      required: true,
    },
    opponent: {
      type: Schema.Types.ObjectId,
      ref: 'Athlete',
      required: true,
    },
    club: {
      type: String,
      required: true,
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
    type: {
      type: String,
      enum: ['A', 'B', 'C'],
      required: true,
    },
    date: Date,
    points: {
      type: Number,
      min: 9,
      max: 45,
      required: true,
    },
    eventOrganizer: {
      type: String,
      required: true,
      validate(eventOrganizer) {
        return new Promise((resolve) => {
          Club.find({ shorthand: eventOrganizer.toUpperCase() }).exec((err, clubs) => {
            let valid = false;
            if (clubs && clubs.length > 0) {
              valid = true;
            }
            resolve(valid);
          });
        });
      },
      message: 'Organizer not found',
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Checks if an Athlete should get a medal or if working towrads a medal.
 * @param {string} medal should be one of four: diploma, bronz, silver, gold.
 * @param {Athlete} athlete Athlete object to whom we are calculating forþ
 * @param {Date} date date of the match the athlete completed.
 */
function calculateAchievements(medal, athlete, date) {
  return new Promise((resolve) => {
    const { achievements } = athlete;
    if (achievements[medal].boutsLeft <= 0) {
      console.log(
        `<> we have an achievement unlock for Athlete ${athlete.name} for medal: ${medal}`,
      );
      achievements[medal].date = date;
    } else {
      console.log(` <> ... Athlete ${athlete.name} working for achievement: ${medal}`);
      achievements[medal].boutsLeft -= 1;
    }
    resolve(achievements);
  });
}

/**
 * This is a function that is assigned to a post save hook of a bout that calculates if
 * an athlete should get a medal or not.
 * @param {doc} bout Mongoose doc of a bout
 */
async function boutPostSaveHookForMedals(bout) {
  try {
    // Fetch athelte info
    const athlete = await Athlete.findOne({ _id: bout.athlete });
    // We first check if the points are high enough for medals, then start to check where
    // athlete is collecting bouts or just got a new medal.
    if (bout.points >= 27 && !athlete.achievements.diploma.date) {
      athlete.achievements = await calculateAchievements('diploma', athlete, bout.date);
      athlete.achievements.bronz.boutsLeft -= 1;
    } else if (bout.points >= 27 && !athlete.achievements.bronz.date) {
      athlete.achievements = await calculateAchievements('bronz', athlete, bout.date);
    } else if (bout.points >= 31 && !athlete.achievements.silver.date) {
      athlete.achievements = await calculateAchievements('silver', athlete, bout.date);
    } else if (bout.points >= 35 && !athlete.achievements.gold.date) {
      athlete.achievements = await calculateAchievements('gold', athlete, bout.date);
    } else {
      return;
    }

    await athlete.save();
    return;
  } catch (error) {
    console.log('Error when working with achievements in bout.post("save") ->', error);
  }
}

BoutSchema.post('save', boutPostSaveHookForMedals);

export default mongoose.model('Bout', BoutSchema);
