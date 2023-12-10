import schema from "../db/schemas";
import { boutsQueries } from "../db/index";
import utils from "../services/utils";

const getMatch = utils.dreamCatcher(async (req, res) => {
  const { id: boutId } = req.params;
  await schema.UUIDv4.validateAsync(boutId, schema.defaultValidationOptions);
  const bout = await boutsQueries.getBoutById(req.db, boutId);
  if (!(bout.length > 0)) {
    return res.status(400).json({ error: "Match not found" });
  }
  return res.json({ match: utils.mapDbObjectToResponse(bout[0]) });
});

const addCompleteMatch = utils.dreamCatcher(async (req, res) => {
  const match = req.body;
  await schema.fullMatchSchema.validateAsync(
    match,
    schema.defaultValidationOptions
  );

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

  await boutsQueries.addCompleteMatch(req.db, athleteAMatch, athleteBMatch);

  const recalcPromiseA = utils.recalculateAndUpdateAchievements(
    req.db,
    athleteAMatch.athleteId
  );
  const recalcPromiseB = utils.recalculateAndUpdateAchievements(
    req.db,
    athleteBMatch.athleteId
  );
  await Promise.all([recalcPromiseA, recalcPromiseB]);

  return res.status(201).json({
    matches: [
      utils.mapDbObjectToResponse(athleteAMatch),
      utils.mapDbObjectToResponse(athleteBMatch),
    ],
  });
});

export default { getMatch, addCompleteMatch };
