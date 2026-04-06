const { validateToken } = require("../services/authentication");
const User = require("../models/user"); // add this to fetch full user from DB

function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];

    if (!tokenCookieValue) {
      req.user = null;
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);

      if (!userPayload) {
        console.log("❌ Invalid token");
        req.user = null;
        return next();
      }

      // Fetch full user from DB to get _id
      const user = await User.findOne({ email: userPayload.email }).lean();
      if (!user) {
        req.user = null;
        return next();
      }

      // Set req.user with proper _id
      req.user = {
        id: user._id.toString(),
        _id: user._id,
        name: user.name,
        email: user.email,
      };
    } catch (error) {
      console.log("❌ Token verify error:", error.message);
      req.user = null;
    }

    next();
  };
}

module.exports = { checkForAuthenticationCookie };