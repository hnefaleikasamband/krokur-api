/**
 * Routings for athlete
 * TODO:
 *  Add get:id to get a detailed view of single athlete
 *  Add put route for editing
 *  Add delete route (perma-delete or flag?)
 * @version 2018.03.28
 */

import Router from 'express';
import kennitala from 'kennitala';
import Athlete from '../models/athlete';
import Bout from '../models/bout';
// To be able to run async/await
import '@babel/polyfill';

const athleteRouter = new Router();

/**
 * Get's all Athletse and sends them back as a JSON array
 * GET  /api/v1/athletes
 */
athleteRouter.get('/', (req, res, next) => {
  Athlete.find({}, (err, athletes) => {
    if (err) {
      res.status(500).json({ message: 'Database Error' });
    }
    res.json({ athletes });
  });
});

/**
 *
 */
athleteRouter.get('/:_id', async (req, res) => {
  try {
    const athlete = await Athlete.findById({ _id: req.params._id });
    if (!athlete) {
      return res.status(404).json();
    }
    res.json({ athlete });
  } catch (error) {
    console.log('Error in GET /api/v1/athlete/_id:', error);
    res.status(500).json({ message: 'Error fetching athelte, check logs for details' });
  }
});

/**
 * Creates a new athlete and saves it in mongo
 * POST /api/v1/athletes
 */
athleteRouter.post('/', async (req, res, next) => {
  // TODO: Validate input
  const name = req.body.name;
  const ssn = kennitala.clean(req.body.ssn);
  const club = req.body.club;
  const tmpAchievements = req.body.achievements;

  try {
    const existingUser = await Athlete.findOne({ ssn });
    if (existingUser) {
      return res.status(400).json({ message: 'Athlete already exists' });
    }

    const athlete = new Athlete({
      name,
      ssn,
      club,
      achievements: tmpAchievements,
    });

    const validateResponse = await athlete.validate();
    console.log('validator response: ', validateResponse);
    await athlete.save();
    // return res.status(201).json({ athlete });
    return res.status(200).redirect(`/api/v1/athletes/${athlete._id}`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    // FIXME: This needs to be logged properly!!
    return res.status(500).json({ message: 'Error saving athlete, check logs for details' });
  }
});

/**
 * Updates a single athlete based on the ID given
 * PUT /api/v1/athlete/
 */
athleteRouter.put('/:_id', async (req, res) => {
  try {
    console.log('The id given:', req.params._id);
    const athlete = await Athlete.findById({ _id: req.params._id });
    console.log('printing athlete:', athlete);
    if (!athlete) {
      return res.status(404).json();
    }
    const name = req.body.name ? req.body.name : athlete.name;
    const ssn = req.body.ssn ? kennitala.clean(req.body.ssn) : athlete.ssn;
    const club = req.body.club ? req.body.club : athlete.club;

    Object.assign(athlete, { name }, { ssn }, { club });
    await athlete.validate();
    await athlete.save();
    // We need to issue a 303 redirect to allow the browser to accept PUT -> GET conversion.
    return res.status(200).redirect(303, `/api/v1/athletes/${req.params._id}`);
  } catch (error) {
    console.log('Error in PUT /athletes/:_id :', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json(error.message);
    }
    return res.status(500).json({ message: 'Error updating athlete, check logs for details' });
  }
});

/**
 * Fetches all bouts for athlete with _id
 * GET /api/v1/athlete/_id/bouts
 */
athleteRouter.get('/:_id/bouts', (req, res, next) => {
  Bout.find({ athlete: req.params._id })
    .populate({ path: 'opponent', select: 'name club' })
    .exec((err, bouts) => {
      if (err) {
        res.status(500).json({ message: 'Database Error' });
      }
      res.json({ bouts });
    });
});

/**
 * Creates a new bout and saves it in mongo
 * POST /api/v1/athlete/:_id/bouts
 */
athleteRouter.post('/:_id/bouts', async (req, res, next) => {
  const bout = new Bout({
    athlete: req.params._id,
    opponent: req.body.opponent,
    club: req.body.club,
    type: typeof req.body.type === 'string' ? req.body.type.toUpperCase() : '',
    date: req.body.date,
    points: req.body.points,
    eventOrganizer: req.body.eventOrganizer,
  });

  try {
    await bout.validate();
    await bout.save();
    const newBout = await Bout.findOne({ _id: bout._id }).populate({
      path: 'opponent',
      select: 'name',
    });
    return res.status(201).json({ bout: newBout });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    // FIXME: This needs to be logged properly!!
    console.log('POST /athlete/id/bouts - Error saving bout ->', error);
    return res.status(500).json({ message: 'Error saving bout, check logs for details' });
  }
});

export default athleteRouter;
