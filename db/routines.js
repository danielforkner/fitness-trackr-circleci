const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

const getAllRoutinesQuery = `
  SELECT routines.*, count, duration, activities.name as "activityName", routine_activities.id AS "routineActivityId", activities.id AS "activityId", description, username AS "creatorName" 
  FROM routines
      JOIN routine_activities ON routines.id = routine_activities."routineId"
      JOIN activities ON activities.id = routine_activities."activityId"
      JOIN users ON routines."creatorId" = users.id
    `;

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows : [routine] } = await client.query(`
      INSERT into routines("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [creatorId, isPublic, name, goal]);

    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineById(id) {
  try {
    const {rows : [routine] } = await client.query(`
      SELECT * 
      FROM routines
      where id = $1
    `, [id]);

    return routine
  } catch (error) {
    console.error(error);
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM routines 
    `);

    return rows
  } catch (error) {
    console.error(error);
  }
}

async function getAllRoutines() {
  try {
    const { rows } = await client.query(getAllRoutinesQuery);

    const routinesObj = await attachActivitiesToRoutines(rows);
    const routines = Object.values(routinesObj);

    return routines;
  } catch (error) {
    console.error(error);
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows } = await client.query(`
      ${getAllRoutinesQuery}
      WHERE "isPublic" = true
    `);

    const routinesObj = await attachActivitiesToRoutines(rows);
    const routines = Object.values(routinesObj);

    return routines;
  } catch (error) {
    console.error(error);
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(`
      ${getAllRoutinesQuery}
      WHERE  username = $1
    `, [username]);

    const routinesObj = await attachActivitiesToRoutines(rows);
    
    const routines = Object.values(routinesObj);

    return routines;
  } catch (error) {
    console.error(error);
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(`
      ${getAllRoutinesQuery}
      WHERE  username = $1
      AND "isPublic" = true
    `, [username]);

    const routinesObj = await attachActivitiesToRoutines(rows);
    const routines = Object.values(routinesObj);

    return routines;
  } catch (error) {
    console.error(error);
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows } = await client.query(`
      ${getAllRoutinesQuery}
      WHERE  "activityId"= $1
      AND "isPublic" = true
    `, [id])

    const routinesObj = await attachActivitiesToRoutines(rows)
    const routines = Object.values(routinesObj)

    return routines;
  } catch (error) {
    console.error(error);
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const setFields = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
      ).join(', ');

      const { rows : [routine] } = await client.query(`
      UPDATE routines
      SET ${setFields}
      WHERE id = ${id}
      RETURNING *
      `, Object.values(fields))
      return routine;
  } catch (error) {
    console.error(error);
  }
}

async function destroyRoutine(id) {
  try {

    await client.query(`
    DELETE FROM routine_activities
    WHERE "routineId" = $1
    `, [id]);

    const {rows: [deletedRoutine]} = await client.query(`
    DELETE FROM routines
    WHERE id = $1
    RETURNING *
    `, [id]);

    return deletedRoutine;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
