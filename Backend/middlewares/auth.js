 /* Routes need to be authenticated
 * checks if authorization token exist
 * checks if token is valid
 * checks if user id is the same in token and request body (if req.body.user_id)
 */

const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");

module.exports = (req, res, next) => {

    try {

        const token = req.headers.authorization.split(" ")[1]; // get token after "Bearer "

        if(!token) {
            return res.status(httpStatus.FORBIDDEN).json({error: "Identification requise !"});
        }

        const decodedToken = jwt.verify(token, `${process.env.JWTSALT}`); // jwt.verify checks signature and expire, return error if not

        // useful to pass userId to next middleware and to controllers
        req.userId = decodedToken.userId;
        req.moderator = Boolean(decodedToken.moderator);

        if (req.body.user_id && req.body.user_id !== req.userId) {
            return res.status(httpStatus.UNAUTHORIZED).json({error: "Identifiant invalide !"});
        }

        next(); // if ok
    }
    catch (err) {
        return res.status(httpStatus.UNAUTHORIZED).json(err);
    }
}