const getBoutById = async (db, id) => db.any('SELECT * from bouts where id = ${id}', { id });

const getAllBoutsForAthlete = async (db, athleteId, order = 'desc') => db.any('SELECT * from bouts where athlete_id = ${athleteId} order by bout_date ${order^}', {
  athleteId,
  order,
});

const addBout = async (db, bout) => db.one(
  'INSERT INTO bouts (athlete_id, athlete_name, athlete_club_shorthand, opponent_id, opponent_name, '
  + 'opponent_club_shorthand, class, bout_date, points, organizer) '
  + 'VALUES(${athleteId}, ${athleteName}, ${athleteClubShortHand}, ${opponentId}, ${opponentName}, '
  + '${opponentClubShortHand}, ${class}, ${boutDate}, ${points}, ${organizer}) RETURNING *',
  bout,
);

const addCompleteMatch = async (db, schemaA, schemaB) => db.tx((t) => {
  const matchA = t.one(
    'INSERT INTO bouts (athlete_id, athlete_name, athlete_club_shorthand, opponent_id, opponent_name, '
    + 'opponent_club_shorthand, class, bout_date, points, organizer) '
    + 'VALUES(${athleteId}, ${athleteName}, ${athleteClubShortHand}, ${opponentId}, ${opponentName}, '
    + '${opponentClubShortHand}, ${class}, ${boutDate}, ${points}, ${organizer}) RETURNING *',
    schemaA,
  );
  const matchB = t.one(
    'INSERT INTO bouts (athlete_id, athlete_name, athlete_club_shorthand, opponent_id, opponent_name, '
    + 'opponent_club_shorthand, class, bout_date, points, organizer) '
    + 'VALUES(${athleteId}, ${athleteName}, ${athleteClubShortHand}, ${opponentId}, ${opponentName}, '
    + '${opponentClubShortHand}, ${class}, ${boutDate}, ${points}, ${organizer}) RETURNING *',
    schemaB,
  );

  return t.batch([matchA, matchB]);
});

export default {
  getBoutById,
  addBout,
  getAllBoutsForAthlete,
  addCompleteMatch,
};
