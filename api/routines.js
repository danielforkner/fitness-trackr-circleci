const express = require("express");
const {
  getAllPublicRoutines,
  createRoutine,
  getRoutineById,
  destroyRoutine,
  getRoutineActivitiesByRoutine,
  addActivityToRoutine,
} = require("../db");
const {
  UnauthorizedUpdateError,
  UnauthorizedDeleteError,
  DuplicateRoutineActivityError,
} = require("../errors");
const router = express.Router();
const { tokenAuth, sliceToken } = require("./utils");

// GET /api/routines
router.get("/", async (req, res, next) => {
  try {
    const publicRoutines = await getAllPublicRoutines();

    res.send(publicRoutines);
  } catch (error) {
    next(error);
  }
});
// POST /api/routines
router.post("/", tokenAuth, async (req, res, next) => {
  try {
    const { id: creatorId } = sliceToken(req);
    const { isPublic, name, goal } = req.body;

    const newRoutine = await createRoutine({ creatorId, isPublic, name, goal });

    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/routines/:routineId
router.patch("/:routineId", tokenAuth, async (req, res, next) => {
  try {
    const { id: userId, username } = sliceToken(req);
    const { routineId } = req.params;
    const { creatorId, name: routineName } = await getRoutineById(routineId);

    if (creatorId !== userId) {
      next({
        error: "Unauthorized User",
        message: UnauthorizedUpdateError(username, routineName),
        name: "Not today, bucko",
        status: 403,
      });
    }
    const { isPublic, name, goal } = req.body;
    const newRoutine = await createRoutine({ creatorId, isPublic, name, goal });

    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:routineId
router.delete("/:routineId", tokenAuth, async (req, res, next) => {
  try {
    const { id: userId, username } = sliceToken(req);
    const { routineId } = req.params;
    const { creatorId, name: routineName } = await getRoutineById(routineId);

    if (creatorId !== userId) {
      next({
        error: "Unauthorized User",
        message: UnauthorizedDeleteError(username, routineName),
        name: "Not today, bucko",
        status: 403,
      });
    }
    const deletedRoutine = await destroyRoutine(routineId);

    res.send(deletedRoutine);
  } catch (error) {
    next(error);
  }
});
// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const { activityId, count, duration } = req.body;
    const routineActivities = await getRoutineActivitiesByRoutine({
      id: routineId,
    });
    routineActivities.forEach(({ routineId: idCheck, activityId }) => {
      if (idCheck !== routineId) {
        next({
          error: "Cannot have the same routine more than once.",
          message: DuplicateRoutineActivityError(routineId, activityId),
          name: "Dupicate Routine error",
          status: 401,
        });
      }
    });
    const addedActivity = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration,
    });
    res.send(addedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
