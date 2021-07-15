const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");

exports.signup = (req, res) => {

    bcrypt.hash(req.body.password, 10)
        .then( hash => {
            User.create({
                firstName: req.body.firstName.trim(),
                lastName: req.body.lastName.trim(),
                email: req.body.email,
                password: hash,
                job: req.body.job.trim()
            })
            .then( () => res.status(httpStatus.CREATED).json({message: "Utilisateur créé !"}))
            .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
        })
        .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
}

exports.login = (req, res) => {

    User.findOne({where: {email: req.body.email}})
        .then( user => {
            if (user === null) {
                return res.status(httpStatus.NOT_FOUND).json({error: "Utilisateur non trouvé !"});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(httpStatus.FORBIDDEN).json({error: "Mot de passe incorrect !" });
                    }
                    res.status(httpStatus.OK).json({ // express.json() = object ---> to json
                        userId: user.id,
                        token: jwt.sign({userId: user.id, moderator: user.moderator}, `${process.env.JWTSALT}`, {expiresIn: "24h"})
                    });
                })
                .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
        })
        .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
}


exports.getProfile = (req, res) => {

    const token =req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, `${process.env.JWTSALT}`);
    const userId = String(decodedToken.userId); // same type as req.params.userId
    const moderator = Number(decodedToken.moderator); // is request user moderator ?
    // moderator need to logout/login to get his new token with moderator set to true

    const canModify = (userId === req.params.userId) ? 1 : 0; // check if user is owner and can modify or delete

    User.findOne({where: {id: req.params.userId}})
        /* don't resend user.password in response (neither email by choice)
         * as it can be a request to see another user profile
         * (when a user clic on another user link on posts page)
         */
        .then( user => res.status(httpStatus.OK).json({
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            job: user.job,
            moderator: moderator, // sent to frontend to display delete/modify buttons for moderator
            canModify: canModify // sent to frontend to display delete/modify buttons for user ressource owner
        }))
        .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
}


exports.modifyUser = async (req, res) => {
    // no need to parse req.body as app use express.json()
    try {
        const hash = req.body.password ? await bcrypt.hash(req.body.password, 10) : undefined;

        User.update({
            firstName: req.body.firstName ? req.body.firstName.trim() : undefined ,
            lastName: req.body.lastName ? req.body.lastName.trim() : undefined,
            email: req.body.email ? req.body.email.trim() : undefined,
            password: hash ? hash : undefined,
            job: req.body.job ? req.body.job.trim() : undefined
        }, {
            where: {id: req.params.userId}
        })
            .then( () => res.status(httpStatus.CREATED).json({message: "Profil modifié !"}))
            .catch(err => res.status(httpStatus.BAD_REQUEST).json(err));
    }
    catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.deleteUser = (req, res) => {
    User.destroy({where: {id: req.params.userId}})
        .then( () => res.status(httpStatus.OK).json({message: "Profil supprimé !"}))
        .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err));
}

