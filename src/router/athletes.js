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
// To be able to run async/await
import 'babel-polyfill';

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
athleteRouter.post('/', async (req, res, next) => {
    // TODO: Validate input
    const name = req.body.name;
    const ssn = req.body.ssn;
    const club = req.body.club;
    const tmpAchievements = req.body.achievements;

    try {
        const existingUser = await Athlete.findOne({ssn: ssn})
        if (existingUser) {
            return res.status(400).send({error: "Athlete already exists"});
        }

        let athlete = new Athlete({
            name: name,
            ssn: ssn,
            club: club,
            achievements: tmpAchievements
        });

        const validateResponse = await athlete.validate();
        console.log('validator response: ', validateResponse);
        await athlete.save();
        return res.status(201).json({athlete});
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({error: error.message} );
        } else {
            // FIXME: This needs to be logged properly!!
            return res.status(500).json({error: "Error saving athlete, check logs for details"});
        }
    }
});


/**
 * Fetches all bouts for athlete with _id
 * GET /api/v1/athlete/_id/bouts
 */
athleteRouter.get("/:_id/bouts", (req, res, next) => {
    Bout.
        find({athlete: req.params._id}).
        populate({ path: "opponent", select: 'name club'}).
        exec( function(err, bouts) {
            if (err) { res.status(500).json({"error": "Database Error"});}
            res.json({bouts});
        });
});

/**
 * Creates a new bout and saves it in mongo
 * POST /api/v1/athlete/:_id/bouts
 */
athleteRouter.post("/:_id/bouts", async (req, res, next) => {
    let bout = new Bout({
        athlete: req.params._id,
        opponent: req.body.opponent,
        club: req.body.club,
        type: typeof req.body.type === "string" ? req.body.type.toUpperCase() : "",
        date: req.body.date,
        points: req.body.points,
        eventOrganizer: req.body.eventOrganizer
    });

    try {
        await bout.validate();
        await bout.save();
        const newBout = await Bout.findOne({_id : bout._id }).populate({ path: "opponent", select: 'name'});
        return res.status(201).json({bout: newBout});
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({error: error.message} );
        } else {
            // FIXME: This needs to be logged properly!!
            return res.status(500).json({error: "Error saving bout, check logs for details"});
        }
    }

});

export default athleteRouter;