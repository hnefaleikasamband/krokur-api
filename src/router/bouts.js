/**
 * Routings for bouts
 * @version 2018.04.13
 */

import Router from "express";
import Bout from "../models/bout";
// To be able to run async/await
import 'babel-polyfill';

const boutRouter = new Router();

/**
 * Get's all bouts and sends them back as a JSON array.
 * if id is given, we get only bout with that id.
 * GET  /api/v1/bouts
 */
boutRouter.get("/:id?", (req, res, next) => {
    if(req.params.id) {
        Bout.
            find({_id: req.params.id}).
            populate({ path: "opponent", select: 'name club'}).
            exec( function(err, bout) {
                if (err) { res.status(500).json({"error": "Database Error"});}
                console.log(bout.opponent);
                res.json({bout});
            });
    } else {
        Bout.
            find().
            populate({ path: "athlete", select: "name club"}).
            populate({ path: "opponent", select: "name club"}).
            exec( function(err, bout) {
                if (err) { res.status(500).json({"error": "Database Error"});}
                console.log(bout.opponent);
                res.json({bout});
            });
    }
});

/**
 * Creates a new bout and saves it in mongo
 * POST /api/v1/bouts
 */
boutRouter.post("/", async (req, res, next) => {
    let bout = new Bout({
        athlete: req.body.athelte,
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
        return res.status(201).json({bout});
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({error: error.message} );
        } else {
            // FIXME: This needs to be logged properly!!
            return res.status(500).json({error: "Error saving bout, check logs for details"});
        }
    }

});
export default boutRouter;