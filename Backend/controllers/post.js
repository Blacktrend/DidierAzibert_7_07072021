const Post = require("../models/post");
const fs = require("fs"); // core module file system needed to delete images
const httpStatus = require("http-status");

exports.createPost = (req, res) => {
    // file + data expected, so need JSON.parse of data
    req.body = req.file ?
        {
            ...JSON.parse(req.body.data),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
        } : req.body;

    Post.create({
        imageUrl: req.body.imageUrl,
        caption: req.body.caption,
        title: req.body.title.trim(),
        content: req.body.content.trim(),
        user_id: req.userId // from auth middleware ***
    })
    .then( () => res.status(httpStatus.CREATED).json({message: "Article créé !"}))
    .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
}

exports.getOnePost = (req, res) => {
    const moderator = req.moderator; // from auth middleware **
    Post.findOne({where: {id: req.params.id}})
        .then( result => res.status(httpStatus.OK).json({result, moderator}))
        .catch(err => res.status(httpStatus.NOT_FOUND).json(err));
}


exports.getAllPosts = (req, res) => {
    Post.findAll({
        order: [
            ['updatedAt', 'DESC']
        ],
        limit: 25
    })
        .then( posts => res.status(httpStatus.OK).json(posts))
        .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
}


exports.modifyPost = async (req, res) => {
    let user_id; // to compare with token userId

    // file + data expected, so need JSON.parse of data
    req.body = req.file ?
        {
            ...JSON.parse(req.body.data),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
        } : req.body;

    Post.findOne({where: {id: req.params.id}})
        .then( post => {
            user_id = post.user_id;

            if(req.body.imageUrl) { // if new image we need to delete the old one

                const filename = post.imageUrl.split("/images/")[1]; // get only filename
                fs.unlink(`images/${filename}`, (err => {
                    if (err) console.error(err);
                    else {
                        console.log("Deleted file: " + filename);
                    }
                }));
            }
        })

        .then( () => {
            console.log("req.moderator = " + req.moderator);
            console.log("ok modo ? " + (req.moderator === true));
            console.log("user_id = " + user_id, "req.userId = " + req.userId);
            console.log("ok owner ? " + (user_id === req.userId));

            if((user_id === req.userId) || (req.moderator === true)) { // check if user is ressource owner or moderator (const from auth middleware)
                Post.update({
                    imageUrl: req.body.imageUrl ? req.body.imageUrl : undefined,
                    caption: req.body.caption ? req.body.caption : undefined,
                    title: req.body.title ? req.body.title.trim() : undefined,
                    content: req.body.content ? req.body.content.trim() : undefined
                }, {
                    where: {id: req.params.id}
                })
                    .then( () => res.status(httpStatus.CREATED).json({message: "Article modifié !"}))
                    .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
            }
            else {
                return res.status(httpStatus.FORBIDDEN).json({error: "Modification interdite !"});
            }
        })

        .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));

}



exports.deletePost = (req, res) => {
    let user_id; // to compare with token userId

    Post.findOne({where: {id: req.params.id}}) // we need first to delete image with fs
        .then( post => {
            user_id = post.user_id;

            console.log("req.moderator = " + req.moderator);
            console.log("ok modo ? " + (req.moderator === true));
            console.log("user_id = " + user_id, "req.userId = " + req.userId);
            console.log("ok owner ? " + (user_id === req.userId));


            if((user_id === req.userId) || (req.moderator === true)) {
                const filename = post.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`,  () => {
                    Post.destroy({where: {id: req.params.id}}) // delete in db after fs unlink
                        .then( () => res.status(httpStatus.OK).json({message: "Article et commentaires liés supprimés !"}))
                        .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
                });
            }
            else {
                return res.status(httpStatus.FORBIDDEN).json({error: "Suppression interdite !"});
            }

        })

        .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
}

