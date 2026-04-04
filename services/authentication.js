const JWT = require("jsonwebtoken");

const secret = "ahmadraza@123";

function createTokenForUser(user){
    const payload = {
        id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role
    };

    return JWT.sign(payload, secret, { expiresIn: "1d" });
}

function validateToken(token){
    try {
        return JWT.verify(token, secret);
    } catch (err) {
        return null;
    }
}

module.exports = {
    createTokenForUser,
    validateToken
};