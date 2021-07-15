const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authModo = require("../middlewares/authModo");
//const limiter = require("../middlewares/limiter");
const commentCtrl = require("../controllers/comment");

// auth for authentication, authModo to check if moderator
router.get("/:postId", auth, commentCtrl.getPostComments);
router.post("/:postId", auth, commentCtrl.createComment);
router.put("/:commentId", auth, authModo, commentCtrl.modifyComment);
router.delete("/:commentId", auth, authModo, commentCtrl.deleteComment);

module.exports = router;