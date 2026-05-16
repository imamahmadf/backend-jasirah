const { env } = require("../config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  dialect: env.DB_CONNECTION,
});

module.exports = {
  sequelize,
};
