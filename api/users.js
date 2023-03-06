/* eslint-disable no-useless-catch */
const express = require("express");
const UserRouter = express.Router();
const { 
  createUser,
  getUser, 
  getUserByUsername, 
  getAllRoutinesByUser, 
  getPublicRoutinesByUser 
} = require("../db");
const jwt = require("jsonwebtoken");
const {
  UserTakenError,
  PasswordTooShortError,
} = require("../errors.js");
const { tokenAuth, sliceToken } = require("./utils");

// POST /api/users/register
UserRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (password.length <= 7) {
      next({
        error: "Short Password",
        message: PasswordTooShortError(),
        name: username,
        status: 400 
      });
    }
    const newUser = await createUser(req.body);

    if (!newUser) {
      next({
        error: "Taken Username",
        message: UserTakenError(username),
        name: username,
        status: 401,
      });
    } else {
      const { id } = newUser;
      const token = jwt.sign(
        { id: id, username },
        process.env.JWT_SECRET
      );
  
      res.send({
        message: "You have successfully registered!",
        token: token,
        user: {
          id: id,
          username: username,
        },
      });
    }

  } catch (error) {
    next(error);
  }
});

// POST /api/users/login
UserRouter.post("/login", async(req, res, next) => {
  const {username, password} = req.body;

  if (!username || !password) {
    next({
      name: "Missing Credentials Error",
      message: "User not found"
    });
  }

  try {
    const user = await getUser({username, password});
    
    if (username == username) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET
      );

      res.send({ 
        message: "you're logged in!",
        token: token,
        user: user,
    })
    } else {
      next ({
        name: "Incorrect Credetials Error",
        message: "Username or password is incorrect"
      })
    }

  } catch (error) {
    next(error);
  }

})

// GET /api/users/me

UserRouter.get('/me', tokenAuth, async (req, res, next) => {

 try{
  const userInfo = sliceToken(req);
 
  const user = await getUserByUsername(userInfo.username)

  if (user) {
    res.send({
      id: user.id, 
      username: user.username
    });
  }
  else {
      res.send('User unavailable');   
  }
} catch (error) {
  next(error);
}

})

// GET /api/users/:username/routines
UserRouter.get('/:username/routines', tokenAuth, async (req, res, next) => {
  try {
    const { username } = req.params;
    const userInfo = sliceToken(req);

    if(username === userInfo.username){
      const  routines = await getAllRoutinesByUser({username});

      res.send(routines);
    }
    
    const publicRoutines = await getPublicRoutinesByUser({username});

    res.send(publicRoutines);
} catch (error) {
  next(error)
}
  
})

module.exports = UserRouter;
