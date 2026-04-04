const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];

        // 🔹 agar cookie hi nahi hai
        if (!tokenCookieValue) {
            return next();   // ✅ MUST
        }

        const userPayload = validateToken(tokenCookieValue);

        // 🔹 agar token invalid hai
        if (!userPayload) {
            console.log("❌ Invalid token");
            req.user = null;
            return next();
        }

        // 🔹 agar sab sahi hai
        req.user = userPayload;
        return next();
    };
}

module.exports = {
    checkForAuthenticationCookie,
};