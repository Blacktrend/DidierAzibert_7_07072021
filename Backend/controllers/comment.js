const Comment = require("../models/comment");
//const User = require("../models/user");
const httpStatus = require("http-status");


exports.createComment = (req, res) => {
    Comment.create({
        content: req.body.content.trim(),
        user_id: req.userId, // from auth middleware
        post_id: req.body.post_id
    })
        .then( () => res.status(httpStatus.CREATED).json({message: "Commentaire créé !"}))
        .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
}


exports.modifyComment = (req, res) => {
    let user_id; // to compare with token userId

    Comment.findOne({where: {id: req.params.commentId}})
        .then( post => {
            user_id = post.user_id;

            console.log("req.moderator = " + req.moderator);
            console.log("ok modo ? " + (req.moderator === true));
            console.log("user_id = " + user_id, "req.userId = " + req.userId);
            console.log("ok owner ? " + (user_id === req.userId));

            if((user_id === req.userId) || (req.moderator === true)) { // check if user is ressource owner or moderator (const from auth middleware)

                Comment.update({
                    content: req.body.content ? req.body.content.trim() : undefined
                }, {
                    where: {id: req.params.commentId} //
                })
                    .then( () => res.status(httpStatus.CREATED).json({message: "Commentaire modifié !"}))
                    .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
            }
            else {
                return res.status(httpStatus.FORBIDDEN).json({error: "Modification interdite !"});
            }
        })

        .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
}


exports.deleteComment = (req, res) => {
    Comment.destroy({where: {id: req.params.commentId}})
        .then( () => res.status(httpStatus.OK).json({message: "Commentaire supprimé !"}))
        .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
}


exports.getPostComments = (req, res) => {
    Comment.findAll({
        order: [
            ['updatedAt', 'DESC']
        ],
        where: {post_id: req.params.postId},
        //include: User, /// doesn't work ???
    })
        .then( comments => res.status(httpStatus.OK).json(comments))
        .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
}
