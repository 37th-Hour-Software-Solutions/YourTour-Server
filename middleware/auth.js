const { verifyAccessToken } = require('../utils/jwt');

/**
 * Express middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateAccessToken = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      return res.status(401).json({
        error: true,
        data: "Authentication required",
      });
    }

    const decoded = verifyAccessToken(accessToken);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      data:
        process.env.NODE_ENV === "development"
          ? error.stack
          : "Authentication failed",
    });
  }
};

module.exports = {
  authenticateAccessToken
};
