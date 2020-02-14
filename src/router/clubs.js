import Router from 'express';
import schema from '../db/schemas';
import { clubsQueries } from '../db/index';
import utils from '../services/utils';

const clubRouter = new Router();

clubRouter.get(
  '/:shorthand?',
  utils.dreamCatcher(async (req, res) => {
    if (req.params.shorthand) {
      const club = utils.mapDbObjectToResponse(
        await clubsQueries.findClubByShorthand(req.db, req.params.shorthand.toUpperCase()),
      );
      if (!club.length > 0) {
        return res.status(404).json({ error: `Could not find club "${req.params.shorthand}"` });
      }
      return res.json(club);
    }

    const clubs = utils.mapDbObjectToResponse(await clubsQueries.getAllClubs(req.db));
    return res.json({ clubs });
  }),
);

clubRouter.post(
  '/',
  utils.dreamCatcher(async (req, res) => {
    const { value: validatedClub } = await schema.clubSchema.validate(
      req.body,
      schema.defaultValidationOptions,
    );
    const exists = await clubsQueries.findClubByShorthand(req.db, req.body.shorthand);
    if (exists.length > 0) {
      return res.status(400).json({ error: 'Club already exists' });
    }

    const club = await clubsQueries.addClub(req.db, validatedClub);
    return res.redirect(303, `/api/v1/clubs/${club.shorthand}`);
  }),
);

clubRouter.put(
  '/:id',
  utils.dreamCatcher(async (req, res) => {
    const club = {
      id: req.params.id,
      ...req.body,
    };
    const { value: validatedClub } = await schema.clubSchema.validate(
      club,
      schema.defaultValidationOptions,
    );

    const exists = await clubsQueries.findClubById(req.db, validatedClub.id);
    if (exists.length <= 0) {
      return res.status(404).json({ error: 'Club does not exists' });
    }

    const updatedClub = await clubsQueries.updateClub(req.db, validatedClub);
    return res.redirect(303, `/api/v1/clubs/${updatedClub.shorthand}`);
  }),
);

export default clubRouter;
