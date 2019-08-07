const getBoutById = async (db, id) => db.any('SELECT * from bouts where id = ${id}', { id });

const getAllBoutsForAthlete = async (db, athleteId) => db.any('SELECT * from bouts where athlete_id = ${athleteId}', { athleteId });

const addBout = async (db, bout) => db.one(
  'INSERT INTO bouts (athlete_id, athlete_name, athlete_club_shorthand, opponent_id, opponent_name, '
      + 'opponent_club_shorthand, class, bout_date, points, organizer) '
      + 'VALUES(${athleteId}, ${athleteName}, ${athleteClubShortHand}, ${opponentId}, ${opponentName}, '
      + '${opponentClubShortHand}, ${class}, ${boutDate}, ${points}, ${organizer}) RETURNING *',
  bout,
);

export default {
  getBoutById,
  addBout,
  getAllBoutsForAthlete,
};
