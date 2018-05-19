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

    Athlete.findOne({ssn: ssn}, (err, existingUser) => {
        if (err ) { return next(err);}
        if (existingUser) {
            return res.status(400).send({error: "Athlete already exists"});
        }

        let athlete = new Athlete({
            name: name,
            ssn: ssn,
            club: club,
            achievements: tmpAchievements
        });
        athlete.validate()
            .then( valid => {
                return athlete.save();
            }, notValid => {
                res.status(400).send({error: notValid.message});
                // FIXME: This is a issue, it goes to the next .then() 
                // and tries to set header after they are set
            })
            .then( success => {
                console.log("trying to set header after validation had failed");
                return res.status(201).json({athlete});
            }, fail => {
                console.log("Could not save athlete: ", fail);
                res.status(400).send({error: fail});
            })
            .catch( error => {
                console.log("caught some error:", error);
                return next(error);
            })
    });
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