/* Modify/delete user routes need to be moderator or owner
 * checks if user is owner or moderator
 * checks if user exists in db
 * checks if moderator from token is the same in database
 */


const httpStatus = require("http-status");
const User = require("../models/user");

module.exports = (req, res, next) => {
        const tokenUserId = String(req.userId); // same type as req.params.userId
        const tokenModerator = req.moderator;

        if(req.params.userId !== tokenUserId && tokenModerator === false) {
            return res.status(httpStatus.FORBIDDEN).json({error: "Modification/Suppression interdites !"});
        }

        User.findOne({where: {id: tokenUserId}})
            .then( user => {
                if (user === null) {
                    return res.status(httpStatus.NOT_FOUND).json({error: "Utilisateur non trouvé !"});
                }
                if (user.moderator !== tokenModerator) {
                    return res.status(httpStatus.FORBIDDEN).json({error: "Modification/Suppression interdites !"});
                }

            })
            .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));

        next();
}