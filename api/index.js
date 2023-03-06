const express = require('express');
const router = express.Router();


// GET /api/health
router.get('/health', async (req, res) => {
  res.send({ success: true , message: "The server is up and healthy"})

});

// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);


// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  res.status(err.status || 500)
  if(err.status){
    delete err.status
  }
  res.send(err)
})

module.exports = router;
