const sequelize = require("../middlewares/db-connect");
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
    // timeStamps are managed by default
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER(8),
        allowNull: false,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        notEmpty: true
    },
    lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        notEmpty: true
    },
    email: {
        unique: true,
        type: DataTypes.STRING(50),
        allowNull: false,
        notEmpty: true,
        isEmail: true,
        len: [6,50]
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        notEmpty: true,
        len: [6,15]
    },
    job: {
        type: DataTypes.STRING(50),
        allowNull: false,
        notEmpty: true
    },
    moderator: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: "Users" // model plural by default but can be explicitly provided
});

module.exports = User; // same as sequelize.models.User


