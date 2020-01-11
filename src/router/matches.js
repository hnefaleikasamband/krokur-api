import Router from 'express';
import kennitala from 'kennitala';
import Joi from 'joi';
import schema from '../db/schemas';
import { athletesQueries, boutsQueries } from '../db/index';
import utils from '../services/utils';
import logger from '../config/logger';

// To be able to run async/await
import '@babel/polyfill';

const matchRouter = new Router();

matchRouter.get(
  '/:id',
  utils.dreamCatcher(async (req, res) => {
    const { id: boutId } = req.params;
    await Joi.validate(boutId, schema.UUIDv4, schema.defaultValidationOptions);
    const bout = await boutsQueries.getBoutById(req.db, boutId);
    if (!bout.length > 0) {
      return res.status(400).json({ error: 'Match not found' });
    }
    return res.json({ match: utils.mapDbObjectToResponse(bout[0]) });
  }),
);

matchRouter.post(
  '/',
  utils.dreamCatcher(async (req, res) => {
    const match = req.body;
    await Joi.validate(match, schema.fullMatchSchema, schema.defaultValidationOptions);

    const athleteAMatch = {
      athleteId: match.athleteAId,
      athleteName: match.athleteAName,
      athleteClubShortHand: match.athleteAClubShortHand,
      points: match.athleteAPoints,
      opponentId: match.athleteBId,
      opponentName: match.athleteBName,
      opponentClubShortHand: match.athleteBClubShortHand,
      class: match.class,
      boutDate: match.boutDate,
      organizer: match.organizer,
    };

    const athleteBMatch = {
      athleteId: match.athleteBId,
      athleteName: match.athleteBName,
      athleteClubShortHand: match.athleteBClubShortHand,
      points: match.athleteBPoints,
      opponentId: match.athleteAId,
      opponentName: match.athleteAName,
      opponentClubShortHand: match.athleteAClubShortHand,
      class: match.class,
      boutDate: match.boutDate,
      organizer: match.organizer,
    };

    // const validMatchA = await Joi.validate(athleteAMatch, schema.boutSchema, schema.defaultValidationOptions);
    // const validMatchB = await Joi.validate(athleteBMatch, schema.boutSchema, schema.defaultValidationOptions);
    await boutsQueries.addCompleteMatch(req.db, athleteAMatch, athleteBMatch);

    const recalcPromiseA = utils.recalculateAndUpdateAchievements(req.db, athleteAMatch.athleteId);
    const recalcPromiseB = utils.recalculateAndUpdateAchievements(req.db, athleteAMatch.athleteId);
    await Promise.all([recalcPromiseA, recalcPromiseB]);

    return res.status(201).json({ matches: [utils.mapDbObjectToResponse(athleteAMatch), utils.mapDbObjectToResponse(athleteAMatch)] });
  }),
);

export default matchRouter;
