const express = require("express");
const app = express();
const helmet = require("helmet");
require("dotenv").config();
/* OU
 * const dotenv = require("dotenv");
 * dotenv.config();
 */
const path = require("path"); // get server path (core module)

app.use(express.json()); // Node core feature - body-parser is deprecated

const sequelize = require("./middlewares/db-connect");
sequelize.authenticate()
    .then( () => console.log("Connection to database has been established successfully."))
    .catch( (error) => console.error("Unable to connect to the database:", error));


const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");

// Headers
app.use(helmet());
app.use( (request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "*"); // don't leave * on production
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});


// images static route
app.use("/images", express.static(path.join(__dirname, "images")));

// routers to use with common path
app.use("/api/auth", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);


module.exports = app;