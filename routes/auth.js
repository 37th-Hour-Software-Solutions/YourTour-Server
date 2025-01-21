const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt.js");
const { db } = require("../utils/database.js");
const { validateFields } = require("../middleware/validate.js");
const { registerSchema } = require("../schemas/register.js");
const { loginSchema } = require("../schemas/login.js");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - name
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 */
router.post('/register', validateFields(registerSchema), async (req, res) => {
    const { email, username, password, name, phone } = req.body;

    try {
        // Check if email already exists
        const checkUserStmt = db.prepare('SELECT id FROM Users WHERE email = ?');
        const existingUser = checkUserStmt.get(email);

        if (existingUser) {
            return res.status(400).json({
                error: true,
                data: {
					message: 'An account with this email already exists'
				}
            });
        }

		// Check if username already exists
		const checkUsernameStmt = db.prepare('SELECT id FROM Users WHERE username = ?');
		const existingUsername = checkUsernameStmt.get(username);
		if (existingUsername) {
			return res.status(400).json({
				error: true,
				data: {
					message: 'An account with this username already exists'
				}
			});
		}

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const insertUserStmt = db.prepare(
            'INSERT INTO Users (username, name, email, hashedPassword, phone) VALUES (?, ?, ?, ?, ?)'
        );
        const result = insertUserStmt.run(username, name, email, hashedPassword, phone);

        // Generate token
        const user = {
            id: result.lastInsertRowid,
            email,
            name
        };
        const token = generateToken(user);

        return res.status(201).json({
            error: false,
            data: { token }
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            error: true,
            data: {
				message: process.env.NODE_ENV === 'development' ? 
					error.stack : 
					'Internal server error'
			}
        });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/login', validateFields(loginSchema), async (req, res) => {
    const { email, password } = req.body;

    try {
        // Get user
        const getUserStmt = db.prepare(
            'SELECT id, email, name, hashedPassword FROM Users WHERE email = ?'
        );
        const user = getUserStmt.get(email);

        if (!user) {
            return res.status(401).json({
                error: true,
                data: {
					message: 'Invalid credentials'
				}
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
        if (!isValidPassword) {
            return res.status(401).json({
                error: true,
                data: {
					message: 'Invalid credentials'
				}
            });
        }

        // Generate token
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name
        });

        return res.json({
            error: false,
            data: { token }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: true,
            data: {
				message: process.env.NODE_ENV === 'development' ? 
					error.stack : 
					'Internal server error'
			}
        });
    }
});

module.exports = router;
