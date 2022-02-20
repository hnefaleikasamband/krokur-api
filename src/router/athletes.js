import kennitala from 'kennitala';
import schema from '../db/schemas';
import { athletesQueries, achievementsQueries, boutsQueries } from '../db/index';
import utils from '../services/utils';
import logger from '../config/logger';

// To be able to run async/await
import '@babel/polyfill';

const getAllAthletesDetailed = utils.dreamCatcher(async (req, res) => {
  const { user } = req;
  if (user.role !== utils.ROLES.ADMIN && (user.role === utils.ROLES.COACH && !user.club)) {
    return res.status(401).json('Unauthorized');
  }

  const athletes = user.role === utils.ROLES.ADMIN
    ? utils.mapDbObjectToResponse(await athletesQueries.getDetailedAllAthletes(req.db))
    : utils.mapDbObjectToResponse(
      await athletesQueries.getDetailedAllAthletesByClub(req.db, user.club.id),
    );
  return res.json({ athletes });
});

const getSingleOrAllAthletes = utils.dreamCatcher(async (req, res) => {
  if (req.params.id) {
    const athlete = await athletesQueries.findAthleteById(req.db, req.params.id);
    if (!athlete.length > 0) {
      return res.status(400).json({ error: 'Athlete not found' });
    }
    return res.json({ athlete: utils.mapDbObjectToResponse(athlete[0]) });
  }

  const athletes = utils.mapDbObjectToResponse(await athletesQueries.getAllAthletes(req.db));
  return res.json({ athletes });
});

const createAthlete = utils.dreamCatcher(async (req, res) => {
  const { user } = req;
  const athlete = req.body;
  if (user.role === utils.ROLES.COACH && user.club.id !== athlete.club) {
    return res.status(401).json('Unauthorized');
  }
  athlete.ssn = kennitala.clean(athlete.ssn);
  if (!kennitala.isValid(athlete.ssn)) {
    return res.status(400).json({ error: 'SSN is not a valid Icelandic SSN' });
  }

  const validatedAthlete = await schema.athleteSchema.validateAsync(
    athlete,
    schema.defaultValidationOptions,
  );

  if (await athletesQueries.athleteExists(req.db, athlete.ssn)) {
    return res.status(400).json({ error: 'Athlete already exists.' });
  }

  const newAthlete = await athletesQueries.addAthlete(req.db, validatedAthlete);
  try {
    await achievementsQueries.startAchievements(req.db, newAthlete.id);
    return res.redirect(303, `/v1/athletes/${newAthlete.id}`);
  } catch (error) {
    logger.error(error);
    await athletesQueries.removeAthlete(req.db, newAthlete.id);
    return res
      .status(500)
      .json({ error: 'Something went wrong, reverting previous steps, check logs for details.' });
  }
});

const updateAthlete = utils.dreamCatcher(async (req, res) => {
  const { user } = req;
  const athlete = req.body;
  if (user.role !== utils.ROLES.ADMIN
    && user.role !== utils.ROLES.JUDGE
    && (user.role === utils.ROLES.COACH && user.club !== athlete.club)) {
    return res.status(401).json('Unauthorized');
  }

  athlete.ssn = kennitala.clean(athlete.ssn);

  if (!kennitala.isValid(athlete.ssn)) {
    return res.status(400).json({ error: 'SSN is not a valid Icelandic SSN' });
  }

  const validatedAthlete = await schema.athleteSchema.validateAsync(
    athlete,
    schema.defaultValidationOptions,
  );

  const oldAthlete = await athletesQueries.getAthleteCleanBasicInfoById(req.db, req.params.id);
  if (!oldAthlete.length > 0) {
    return res.status(404).json({ error: 'Athletes does not exists.' });
  }

  const newAthleteInfo = { ...oldAthlete[0], ...validatedAthlete };
  const savedAthlete = await athletesQueries.updateAthlete(req.db, newAthleteInfo);
  return res.redirect(303, `/v1/athletes/${savedAthlete.id}`);
});

const getMatchesForAthlete = utils.dreamCatcher(async (req, res) => {
  const { athleteId } = req.params;
  const bouts = utils.mapDbObjectToResponse(
    await boutsQueries.getAllBoutsForAthlete(req.db, athleteId),
  );
  return res.json({ bouts });
});

const addMatchForSingleAthlete = utils.dreamCatcher(async (req, res) => {
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
  const validBout = await schema.boutSchema.validateAsync(bout, schema.defaultValidationOptions);
  const newBout = await boutsQueries.addBout(req.db, validBout);
  await utils.recalculateAndUpdateAchievements(req.db, athleteId);
  return res.status(201).json(utils.mapDbObjectToResponse(newBout));
});

const recalculateAthleteAchievement = utils.dreamCatcher(async (req, res) => {
  const { athleteId } = req.params;

  await utils.recalculateAndUpdateAchievements(req.db, athleteId);
  return res.status(200).json({ message: `Successfully triggered recalculation for id: ${athleteId}` });
});

export default {
  getSingleOrAllAthletes,
  getAllAthletesDetailed,
  createAthlete,
  updateAthlete,
  getMatchesForAthlete,
  addMatchForSingleAthlete,
  recalculateAthleteAchievement,
};
