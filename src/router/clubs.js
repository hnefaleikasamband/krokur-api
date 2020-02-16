import schema from '../db/schemas';
import { clubsQueries } from '../db/index';
import utils from '../services/utils';


const getClubData = utils.dreamCatcher(async (req, res) => {
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
});

const addClub = utils.dreamCatcher(async (req, res) => {
  const { value: validatedClub } = await schema.clubSchema.validate(
    req.body,
    schema.defaultValidationOptions,
  );
  const exists = await clubsQueries.findClubByShorthand(req.db, req.body.shorthand);
  if (exists.length > 0) {
    return res.status(400).json({ error: 'Club already exists' });
  }

  const club = await clubsQueries.addClub(req.db, validatedClub);
  return res.redirect(303, `/v1/clubs/${club.shorthand}`);
});

const updateClub = utils.dreamCatcher(async (req, res) => {
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
  return res.redirect(303, `/v1/clubs/${updatedClub.shorthand}`);
});

export default { getClubData, addClub, updateClub };
