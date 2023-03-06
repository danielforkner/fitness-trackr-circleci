const express = require('express');
const { canEditRoutineActivity, updateRoutineActivity, getRoutineActivityById, getRoutineById, destroyRoutineActivity } = require('../db');
const router = express.Router();
const { UnauthorizedUpdateError, UnauthorizedDeleteError } = require('../errors');
const { tokenAuth, sliceToken } = require("./utils");

// PATCH /api/routine_activities/:routineActivityId

router.patch('/:routineActivityId', tokenAuth, async (req, res, next) => {

 
try {
    const body = req.body; 

    const {routineActivityId} = req.params;
    const { id: userId, username } = sliceToken(req)
    const isUser = await canEditRoutineActivity(routineActivityId, userId);

      if (!isUser) {
        const {routineId} = await getRoutineActivityById(routineActivityId)    
        const {name} = await getRoutineById(routineId)

       next({
            error: 'Unauthorized beans',
            message:UnauthorizedUpdateError(username, name) ,
            name: 'beans',
            status: 403
        })
      } 

    const activity = await updateRoutineActivity({id: routineActivityId, ...body});

    res.send(activity) 
} catch (error) {
    next(error)
}

})

// DELETE /api/routine_activities/:routineActivityId

router.delete('/:routineActivityId', tokenAuth, async (req, res, next) => {
    try {
      const { id: userId, username } = sliceToken(req)
      const { routineActivityId } = req.params;
      const {routineId} = await getRoutineActivityById(routineActivityId);
      const { creatorId, name } = await getRoutineById(routineId);

      if(creatorId !== userId){
        next({
          error: 'Unauthorized beans',
          message: UnauthorizedDeleteError(username, name),
          name: 'beans',
          status: 403
        })
      }
      const deletedRoutineActivity = await destroyRoutineActivity(routineActivityId)
      res.send(deletedRoutineActivity)
    } catch (error) {
        next(error)
    }
})

module.exports = router;
