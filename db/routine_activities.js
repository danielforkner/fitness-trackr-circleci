const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {rows : [routineActivity]} = await client.query(`
      INSERT INTO routine_activities("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [routineId, activityId, count, duration])
   
    return routineActivity
  } catch (error) {
    console.error(error)
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows : [routineActivity] } = await client.query(`
    SELECT * 
    FROM routine_activities 
    WHERE id = $1
    `, [id])

    return routineActivity;
  } catch (error) {
   console.error(error) 
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId" = $1
    ` ,[id])
    return rows;
  } catch (error) {
   console.error(error) 
  }
}

async function updateRoutineActivity({ id, ...fields }) {  
  
  try {
    const setFields = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    const { rows : [routineActivity] } = await client.query(`
      UPDATE routine_activities
      SET ${setFields}
      WHERE id = ${id}
      RETURNING *
      `, Object.values(fields))

     return routineActivity;
  } catch (error) {
  console.error(error);
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows : [routineActivity] } = await client.query(`
    DELETE FROM routine_activities
    WHERE id = $1
    RETURNING *
    `, [id])

    return routineActivity;
  } catch (error) { 
    console.log(error);
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows : [routine] } = await client.query(`
      SELECT  "creatorId", routs.id AS "routId", routine_activities.id
      FROM routines routs
      JOIN routine_activities ON routs.id = routine_activities."routineId"
      WHERE  routine_activities.id = $1
    `, [routineActivityId])

    return routine.creatorId === userId
  } catch (error) {
   console.error(error) 
  }
}



module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
