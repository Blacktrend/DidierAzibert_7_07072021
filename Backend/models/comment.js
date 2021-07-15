const sequelize = require("../middlewares/db-connect");
const { DataTypes } = require('sequelize');
const User = require("../models/user");
const Post = require("../models/post");

const Comment = sequelize.define('Comment', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER(8),
        references: {
            model: User,
            key: "id"
        }
    },
    post_id: {
        type: DataTypes.INTEGER(11),
        references: {
            model: Post,
            key: "id"
        }
    }
}, {
    tableName: "Comments" // model plural by default but can be explicitly provided
});

module.exports = Comment; // same as sequelize.models.Post


