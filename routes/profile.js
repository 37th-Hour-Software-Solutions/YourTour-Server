const express = require("express");
const router = express.Router();
const { db } = require("../utils/database.js");
const { validateFields } = require("../middleware/validate.js");
const { registerSchema } = require("../schemas/register.js");
const { authenticateAccessToken } = require("../middleware/auth.js");


/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/', authenticateAccessToken, async (req, res) => {
  const getUserStmt = db.prepare('SELECT id, username, name, email, phone, homestate, interests, gemsFound, badges FROM Users WHERE id = ?');
  
  try {
      const user = getUserStmt.get(req.user.id);
      return res.json({ error: false, data: user });
  } catch (error) {
      console.error('Profile error:', error);
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