/**
 * Routings for athlete
 * TODO: 
 *  Add get:id to get a detailed view of single athlete
 *  Add put route for editing
 *  Add delete route (perma-delete or flag?)
 * @version 2018.03.28
 */

import Router from "express";
import Athlete from "../models/athlete";
import Bout from "../models/bout";

const athleteRouter = new Router();

/**
 * Get's all Athletse and sends them back as a JSON array
 * GET  /api/v1/athletes
 */
athleteRouter.get('/', (req, res, next) => {
    Athlete.find({}, (err, athletes) => {
        if (err) { res.status(500).json({"error": "Database Error"});}
        res.json({athletes});
    });
});

/**
 * Creates a new athlete and saves it in mongo
 * POST /api/v1/athletes
 */
athleteRouter.post('/', (req, res, next) => {
    // TODO: Validate input
    const name = req.body.name;
    const ssn = req.body.ssn
    const club = req.body.club;
    const tmpAchievements = req.body.achievements;

    // Return error if full name not provided
    if (!name || !name.length) {
        return res.status(400).json({ error: "Missing name."});
    }

    // Return error if SSN/KT not present and not equal to 10
    // TODO: Must add check if valid icelandic ssn/kt.
    if (!ssn || !ssn.length || ssn.length != 10) {
        return res.status(400).json({ error: "SSN/KT missing or incorrect"});
    }

    const achievements = {};
    // Return error if achievements are not a date
    for(const a in tmpAchievements) {
        // TODO: Make sure that valid date is being set
        // Testing
        if (a) {
            console.log('achievement: ', a, " , value: ", tmpAchievements[a]);
            const newDate = Date.parse(tmpAchievements[a]);
            console.log(newDate);
            if(!newDate) return res.status(400).json({ error: `Date format not correct for: ${a}`});
            achievements[a] = newDate
        }
    }
    console.log("achievements: ", achievements);
    // TODO: Check if unique keys already exist
    Athlete.findOne({ssn: ssn}, (err, existingUser) => {
        if (err) {return next(err);}
        // If Athletes ssn/kt is not unique, return error
        if (existingUser) {
            return res.status(400).send({error: "That kennitala is already in use."});
        }

        let athlete = new Athlete({
            name: name,
            ssn: ssn,
            achievements: achievements
        });
        console.log('athlete', athlete)

        if(club) athlete.club = club;
        athlete.validate().then( done => { console.log('validated: ', done)}, err => { console.log('error', err)})
        // TODO: Create new athlete and save him.
        athlete.save()
        .then( success => {
            console.log(success);
            res.status(201).json({athlete});
        }, reason => {
            return next(reason);
        })
    });
});


/**
 * Fetches all bouts for athlete with _id
 * GET /api/v1/athlete/_id/bouts
 */
athleteRouter.get("/:_id/bouts", (req, res, next) => {
    Bout.find({athlete: req.params._id}, (err, bouts) => {
        if (err) { res.status(500).json({"error": "Database Error"});}
        res.json({bouts});
    });
});

/**
 * Creates a new bout and saves it in mongo
 * POST /api/v1/athlete/:_id/bouts
 */
athleteRouter.post("/:_id/bouts", (req, res, next) => {
    let bout = new Bout({
        athlete: req.params._id,
        opponent: req.body.opponent,
        type: typeof req.body.type === "string" ? req.body.type.toUpperCase() : "",
        date: req.body.date,
        points: req.body.points,
        eventOrganizer: req.body.eventOrganizer
    });

    bout.validate()
        .then(valid => {
            return bout.save();
        }, notValid => {
            res.status(400).send({error: notValid.message});
        })
        .then( success => {
            return res.status(201).json({bout});
        }, fail => {
            console.log("could not save: ", fail);
            res.status(400).send({error: fail});
        })
        .catch( (error) => {
            return next(error);
        });

});

export default athleteRouter;