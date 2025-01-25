const jwt = require('jsonwebtoken');

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'oh_boy_if_we_made_it_here_then_something_terrible_happened';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'oh_boy_if_we_made_it_here_then_something_terrible_happened';

/**
 * Generates a JWT token for a user
 * @param {Object} user - User object containing id, email, and name
 * @returns {string} JWT token
 * @throws {Error} If user object is invalid
 */
const generateAccessToken = (user) => {
    if (!user || !user.id || !user.email) {
        throw new Error('Invalid user object provided');
    }

    const payload = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1h"
    });
};

/**
 * Generates a refresh token for a user
 * @param {Object} user - User object containing id and email
 * @returns {string} Refresh token
 * @throws {Error} If user object is invalid
 */
const generateRefreshToken = (user) => {
    if (!user || !user.id) {
        throw new Error('Invalid user object provided');
    }

    const payload = {
        id: user.id
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "365d"
    });
};

/**
 * Verifies a JWT token and returns the decoded payload
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Verifies a refresh JWT token and returns the decoded payload
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};