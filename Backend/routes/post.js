const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authModo = require("../middlewares/authModo");
//const limiter = require("../middlewares/limiter");
const multer = require("../middlewares/multer-config");
const postCtrl = require("../controllers/post");

// auth for authentication, authModo to check if moderator
router.get("/", auth, postCtrl.getAllPosts);
router.get("/:id", auth, postCtrl.getOnePost);
router.post("/", auth, multer, postCtrl.createPost);
router.patch("/:id", auth, multer, authModo, postCtrl.modifyPost); // don't forget multer !!
router.patch("/alt/:id", auth, authModo, postCtrl.modifyPost); // don't apply multer !!
router.delete("/:id", auth, authModo, postCtrl.deletePost);

module.exports = router;