/**
 * Routings for clubs
 * @version 2018.05.19
 */

import Router from "express";
import Club from "../models/club";
// To be able to run async/await
import 'babel-polyfill';

const clubRouter = new Router();

/**
 * Finds and returns all clubs or if shorthand is give, returns only that if exists.
 * @returns clubs[]
 * GET  /api/v1/clubs
 */
clubRouter.get("/:shorthand?", (req, res, next) => {
    if(req.params.shorthand) {
        Club.
            find({shorthand: req.params.shorthand.toUpperCase()}).
            exec( function(err, clubs) {
                if (err) { res.status(500).json({"error": "Database Error"});}
                else { res.json({clubs}); }
            });
    } else {
        Club.
            find().
            exec( function(err, clubs) {
                if (err) { res.status(500).json({"error": "Database Error"});}
                else {
                    res.json({clubs});
                }
            });
    }
});

/**
 * Gets a new club in the body, validates it and saves it to mongo
 * club
 *  - name: string
 *  - shorthand: string
 *  - info?: string
 * 
 * @returns club
 * POST /api/v1/clubs
 */
clubRouter.post("/", async (req, res, next) => {
    let club = new Club({
        name: req.body.name,
        shorthand: req.body.shorthand,
        info: typeof req.body.type === "string" ? req.body.type.toUpperCase() : ""
    });

    try {
        await club.validate();
        await club.save();
        return res.status(201).json({club});
    } catch (error){
        if (error.name === 'ValidationError') {
            return res.status(400).json({error: error.message} );
        } else {
            // FIXME: This needs to be logged properly!!
            return res.status(400).json({error: "Error saving club, check logs for details"});
        }
    }

});

export default clubRouter;