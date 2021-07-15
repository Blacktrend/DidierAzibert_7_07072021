// Sequelize generates prepared sql queries

const { Sequelize } = require("sequelize"); //Mysql ORM

// MySQL connection
const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    logging: false,
    host: process.env.DBHOST,
    dialect: process.env.DBDIALECT
});

module.exports = sequelize;