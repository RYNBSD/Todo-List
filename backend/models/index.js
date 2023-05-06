const { Sequelize } = require('sequelize');

const { USERS, TODOS } = require("./tables");
const { DB } = require("../constants");

async function connection() {
  const sequelize = new Sequelize(DB.DATABASE, DB.USERNAME, DB.PASSWORD, {
    host: DB.HOST, // localhost
    dialect: "mysql", // mysql
  });

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    return null;
  }
}

async function initialDB() {
  const TABLES = [USERS, TODOS];
  const sequelize = await connection();

  try {
    for (const table of TABLES) {
      await sequelize.query(table, {
        logging: false,
      });
    }
  }
  catch (e) {
    console.error("Can't create tables!!!: ", e.message);
  }
  finally {
    await sequelize?.close();
  }
}

module.exports = {
  connection,
  initialDB,
}