import Router from 'express';
import kennitala from 'kennitala';
import Joi from 'joi';
import schema from '../db/schemas';
import { athletesQueries, achievementsQueries, boutsQueries } from '../db/index';
import utils from '../services/utils';

// To be able to run async/await
import '@babel/polyfill';

const athleteRouter = new Router();

athleteRouter.get(
  '/club-view',
  utils.dreamCatcher(async (req, res) => {
    console.log(req);
    const { user } = req;
    if (user.role !== 'ADMIN' && (user.role === 'COACH' && !user.club)) {
      return res.status(401).json('Unauthorized');
    }

    const athletes = user.role === 'ADMIN'
      ? utils.mapDbObjectToResponse(await athletesQueries.getDetailedAllAthletes(req.db))
      : utils.mapDbObjectToResponse(
        await athletesQueries.getDetailedAllAthletesByClub(req.db, user.club.toUpperCase()),
      );
    return res.json({ athletes });
  }),
);

athleteRouter.get(
  '/:id?',
  utils.dreamCatcher(async (req, res) => {
    if (req.params.id) {
      const athlete = await athletesQueries.findAthleteById(req.db, req.params.id);
      if (!athlete.length > 0) {
        return res.status(400).json({ error: 'Athlete not found' });
      }
      return res.json({ athlete: utils.mapDbObjectToResponse(athlete[0]) });
    }

    const athletes = utils.mapDbObjectToResponse(await athletesQueries.getAllAthletes(req.db));
    return res.json({ athletes });
  }),
);

athleteRouter.post(
  '/',
  utils.dreamCatcher(async (req, res) => {
    const athlete = req.body;
    athlete.ssn = kennitala.clean(athlete.ssn);
    if (!kennitala.isValid(athlete.ssn)) {
      return res.status(400).json({ error: 'SSN is not a valid Icelandic SSN' });
    }

    const validatedAthlete = await Joi.validate(
      athlete,
      schema.athleteSchema,
      schema.defaultValidationOptions,
    );

    if (await athletesQueries.athleteExists(req.db, athlete.ssn)) {
      return res.status(400).json({ error: 'Athlete already exists.' });
    }

    const newAthlete = await athletesQueries.addAthlete(req.db, validatedAthlete);
    try {
      await achievementsQueries.startAchievements(req.db, newAthlete.id);
      return res.redirect(303, `/api/v1/athletes/${newAthlete.id}`);
    } catch (error) {
      console.log(error);
      await athletesQueries.removeAthlete(req.db, newAthlete.id);
      return res
        .status(500)
        .json({ error: 'Something went wrong, reverting previous steps, check logs for details.' });
    }
  }),
);

athleteRouter.put(
  '/:id',
  utils.dreamCatcher(async (req, res) => {
    const athlete = req.body;
    athlete.ssn = kennitala.clean(athlete.ssn);

    if (!kennitala.isValid(athlete.ssn)) {
      return res.status(400).json({ error: 'SSN is not a valid Icelandic SSN' });
    }

    const validatedAthlete = await Joi.validate(
      athlete,
      schema.athleteSchema,
      schema.defaultValidationOptions,
    );

    const oldAthlete = await athletesQueries.getAthleteCleanBasicInfoById(req.db, req.params.id);
    if (!oldAthlete.length > 0) {
      return res.status(404).json({ error: 'Athletes does not exists.' });
    }

    const newAthleteInfo = { ...oldAthlete[0], ...validatedAthlete };
    const savedAthlete = await athletesQueries.updateAthlete(req.db, newAthleteInfo);
    return res.redirect(303, `/api/v1/athletes/${savedAthlete.id}`);
  }),
);

athleteRouter.get(
  '/:athleteId/bouts',
  utils.dreamCatcher(async (req, res) => {
    const { athleteId } = req.params;
    const bouts = utils.mapDbObjectToResponse(
      await boutsQueries.getAllBoutsForAthlete(req.db, athleteId),
    );
    return res.json({ bouts });
  }),
);

athleteRouter.post(
  '/:athleteId/bouts',
  utils.dreamCatcher(async (req, res) => {
    const bout = req.body;
    const { athleteId } = req.params;

    if (
      !bout.athleteId
      || bout.athleteId !== athleteId
      || !bout.athleteName
      || !bout.athleteClubShortHand
    ) {
      const athlete = (await athletesQueries.findAthleteById(req.db, athleteId))[0];
      bout.athleteId = athleteId;
      bout.athleteName = athlete.name;
      bout.athleteClubShortHand = athlete.club_shorthand;
    }
    const validBout = await Joi.validate(bout, schema.boutSchema, schema.defaultValidationOptions);

    const currentAchievements = await achievementsQueries.getAchievementStatus(req.db, athleteId);
    const newBout = await boutsQueries.addBout(req.db, validBout);
    try {
      const achievementScore = utils.achievementCheck({
        athleteId,
        ...currentAchievements[0],
        points: bout.points,
        date: bout.boutDate,
      });
      if (achievementScore.needsToUpdate) {
        await achievementScore.updateAchievement(req.db, athleteId);
      }
    } catch (error) {
      console.log('<> ERROR, COULD NOT UPDATE ACHIEVEMENT BECAUSE:', error);
      return res
        .status(500)
        .json({ error: 'Could not save bout, error updating achievement history.' });
    }

    return res.status(201).json(utils.mapDbObjectToResponse(newBout));
  }),
);

export default athleteRouter;
