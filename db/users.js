const client = require("./client");
const bcrypt = require("bcrypt")

const saltRounds = 10;

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds)  
  
    const { rows: [user] } = await client.query(`
      INSERT INTO users(username, password)
      VALUES ($1, $2)
      RETURNING id, username
    `, [username, hashedPassword]) 
  
    return user;

  } catch (error) {
    console.error(error)
  }
}

async function getUser({ username, password }) {
try { 

    const { rows: [user] } = await client.query(`
      SELECT * 
      FROM users 
      WHERE username =$1
      ` ,[username])
// console.log(user);
if (!user) {
  throw new Error('Could not get user');
}
  const hashedPassword = user.password;
  const match = await bcrypt.compare(password, hashedPassword)

  if (match) {
    delete user.password;
    return user;
  }  

} catch (error) {
  console.error(error);
}


}

async function getUserById(userId) {
  try {

    const { rows: [user]} = await client.query(`
    SELECT username, id
    FROM users
    WHERE id = $1
    `, [userId])

    return user;
  } catch (error) {
    console.error(error);
  }
}

async function getUserByUsername(userName) {
  try {

    const { rows: [user]} = await client.query(`
    SELECT *
    FROM users
    WHERE username = $1
    `, [userName])

    return user;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
