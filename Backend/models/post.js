const sequelize = require("../middlewares/db-connect");
const { DataTypes } = require('sequelize');
const User = require("../models/user");

const Post = sequelize.define('Post', {
    // timeStamps are managed by default
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate : {
            notEmpty: true
        }
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT("long"),
        allowNull: false
    },
    user_id: { // allowNull true by default
        type: DataTypes.INTEGER(8),
        references: {
            model: User,
            key: "id"
        }
    }
}, {
    tableName: "Posts" // model plural by default but can be explicitly provided
});

module.exports = Post; // same as sequelize.models.Post


