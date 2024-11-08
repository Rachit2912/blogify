const { validateToken } = require("../services/authentication");

// Middleware to check for authentication cookie and set req.user if valid
function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload; // Attach user data to req.user if token is valid
    } catch (error) {
      console.error("Token validation failed:", error);
    }

    return next();
  };
}

// Middleware to require authentication on specific routes
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).send("User not authenticated");
  }
  next();
}

module.exports = {
  checkForAuthenticationCookie,
  requireAuth,
};
