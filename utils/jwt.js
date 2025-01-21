const jwt = require('jsonwebtoken');

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'oh_boy_if_we_made_it_here_then_something_terrible_happened';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generates a JWT token for a user
 * @param {Object} user - User object containing id, email, and name
 * @returns {string} JWT token
 * @throws {Error} If user object is invalid
 */
const generateToken = (user) => {
    if (!user || !user.id || !user.email) {
        throw new Error('Invalid user object provided');
    }

    const payload = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Verifies a JWT token and returns the decoded payload
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = {
    generateToken,
    verifyToken
};
