const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authModo = require("../middlewares/authUsers");
//const limiter = require("../middlewares/limiter");
const userCtrl = require("../controllers/user");

// auth for authentication, authModo to check if moderator
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.get("/:userId", auth, userCtrl.getProfile);
router.patch("/:userId", auth, authModo, userCtrl.modifyUser);
router.delete("/:userId", auth, authModo, userCtrl.deleteUser);

module.exports = router;