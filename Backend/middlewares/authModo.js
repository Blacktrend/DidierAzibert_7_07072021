/* Modify/delete posts/comments routes need to be moderator or owner
 * checks if user is moderator
 * checks if user exists in db
 * checks if moderator from token is the same in database
 */

const httpStatus = require("http-status");
const User = require("../models/user");

module.exports = (req, res, next) => {
    const tokenUserId = String(req.userId);
    const tokenModerator = req.moderator; // boolean

    if(tokenModerator === true) {
        User.findOne({where: {id: tokenUserId}})
            .then( user => {
                if (user === null) {
                    return res.status(httpStatus.NOT_FOUND).json({error: "Utilisateur non trouvé !"});
                }

                if (Boolean(user.moderator) !== tokenModerator) {
                    return res.status(httpStatus.FORBIDDEN).json({error: "Interdit ! Problème de token !"});
                }
            })
            .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
    }

        next();
}