const { generateToken, verifyToken } = require('../utils/jwt');

/**
 * Express middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({
                error: true,
                data: 'Authentication required'
            });
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            data: process.env.NODE_ENV === 'development' ? 
                error.stack : 
                'Authentication failed'
        });
    }
};

module.exports = {
    authenticateToken
};
