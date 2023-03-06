const express = require("express");
const {
  getAllActivities,
  getPublicRoutinesByActivity,
  createActivity,
  updateActivity,
  getActivityByName,
} = require("../db");
const { 
  ActivityExistsError, 
  ActivityNotFoundError 
} = require("../errors");
const router = express.Router();

// GET /api/activities/:activityId/routines

router.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;

  try {
    const routinesByActivity = await getPublicRoutinesByActivity({
      id: activityId,
    });

    if (!routinesByActivity.length) {
      res.status(400).send({
        error: "Failed to get activities",
        message: ActivityNotFoundError(activityId),
        name: "Activity Not Found",
      });
    } else {
      res.send(routinesByActivity);
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/activities

router.get("/", async (req, res, next) => {
  try {
    const getActivities = await getAllActivities();

    res.send(getActivities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities

router.post("/", async (req, res, next) => {
  const { name, description } = req.body;

  try {
    if (!name || !description) {
      res.status(418).send({
        error: "teapot",
        message: "name or description was not found",
        name: "more teapots",
      });
    } else {
      const activity = await createActivity(req.body);

      if (!activity) {
        res.status(418).send({
          error: "teapot",
          message: ActivityExistsError(req.body.name),
          name: "more teapots",
        });
      }

      res.send(activity);
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId

router.patch("/:id", async (req, res, next) => {
  try {
    if (req.body.name) {
      const activityName = await getActivityByName(req.body.name);
      if (activityName) {
        next({
          error: "you shall not edit",
          name: "Unable to edit",
          message: ActivityExistsError(req.body.name),
          status: 401
        });
      }
    }

    const activity = await updateActivity({ id: req.params.id, ...req.body });
    if (!activity) {
      next({
        error: "you shall not edit",
        name: "Unable to edit",
        message: ActivityNotFoundError(req.params.id),
        status: 404
      });
    } else {
      res.send(activity);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
