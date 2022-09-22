const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev'); // connection to table we created in psql

async function getAllUsers() {
    const { rows } = await client.query( // this seems like where we put command we would use in terminal to retrieve data
      `SELECT id, username 
      FROM users;
    `);
  
    return rows;
  }

async function createUser({ username, password }) {
    try {
    const { rows } = await client.query(`  
      INSERT INTO users(username, password) 
      VALUES($1, $2) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
      `, [ username, password ]);
  
      return rows
    } catch (error) {
      throw error;
    }
  }

module.exports = {
  client,
  getAllUsers,
  createUser,
}
