/**
 * Routings for bouts
 * @version 2018.04.13
 */

import Router from "express";
import Bout from "../models/bout";

const boutRouter = new Router();

/**
 * Get's all bouts and sends them back as a JSON array.
 * if id is given, we get all bouts for that id.
 * GET  /api/v1/bouts
 */
boutRouter.get("/:_id?", (req, res, next) => {
    if( req.params._id) {
        Bout.find({athlete: req.params._id}, (err, bouts) => {
            if (err) { res.status(500).json({"error": "Database Error"});}
            res.json({bouts});
        });
    } else {
        Bout.find({}, (err, bouts) => {
            if (err) { res.status(500).json({"error": "Database Error"});}
            res.json({bouts});
        });
    }
});

/**
 * Creates a new bout and saves it in mongo
 * POST /api/v1/bouts
 */
boutRouter.post("/bouts", (req, res, next) => {
    let bout = new Bout({
        athlete: req.body.athelte,
        opponent: req.body.opponent,
        type: typeof req.body.type === "string" ? req.body.type.toUpperCase() : "",
        date: req.body.date,
        points: req.body.points,
        eventOrganizer: req.body.eventOrganizer
    });

    bout.validate()
        .then( valid => {
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
export default boutRouter;