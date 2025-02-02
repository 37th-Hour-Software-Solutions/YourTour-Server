const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { db } = require("../utils/database.js");
const { validateFields } = require("../middleware/validate.js");
const { profileSchema } = require("../schemas/profile.js");
const { authenticateAccessToken } = require("../middleware/auth.js");


/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 * /profile:
 *   get:
 *     summary: Get user profile
 *     description: Returns the user's profile information
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
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
  const getUserStmt = db.prepare('SELECT id, username, email, phone, homestate, gemsFound FROM Users WHERE id = ?');
  
  const getUserBadgesStmt = db.prepare(`SELECT b.name, b.description, b.static_image_url FROM Badges b JOIN UserBadges ub ON b.id = ub.badge_id WHERE ub.user_id = ?`);
  const getUserInterestsStmt = db.prepare(`SELECT i.name FROM Interests i JOIN UserInterests ui ON i.id = ui.interest_id WHERE ui.user_id = ?`);

  try {
      let user = getUserStmt.get(req.user.id);
      user.badges = getUserBadgesStmt.all(req.user.id);
      user.interests = getUserInterestsStmt.all(req.user.id);
      console.log(user.badges);
      return res.json({ error: false, data: user});
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


/**
 * @swagger
 * /profile/update:
 *   post:
 *     summary: Update user details
 *     description: Allows a user to update their email, username, password, phone number, homestate, and interests.
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *               username:
 *                 type: string
 *                 example: "JohnDoe"
 *               oldPassword:
 *                 type: string
 *                 example: "PASSWORd123$$"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "new_PASSWORd123$$"
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               homestate:
 *                 type: string
 *                 example: "NY"
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Culture", "History", "Geography"]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User updated successfully"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
*/

router.post('/update', validateFields(profileSchema), authenticateAccessToken, async (req, res) => {
  const {email, username, oldPassword, password, phone, homestate, interests } = req.body;

  try {
    // Prepare dynamic SQL query and parameters based on provided fields
    let sqlSetParts = [];
    let sqlParams = [];
    
    const user = db.prepare('SELECT * FROM Users WHERE id = ?').get(req.user.id);     

    // Make sure the old password is correct, otherwise fail to update
    if (!bcrypt.compareSync(oldPassword, user.hashedPassword)) {
      return res.status(400).json({
        error: true,
        data: { message: 'Old password is incorrect' }
      }); 
    }
      
    // Make sure the new password is not the same as the old password
    if (password && oldPassword == password) {
      return res.status(400).json({
        error: true,
        data: { message: 'New password cannot be the same as the old password' }
      });
    }

    // Make sure the new email is not already in use
    if (email) {
      const checkEmailStmt = db.prepare('SELECT id FROM Users WHERE email = ? AND id != ?');
      const emailExists = checkEmailStmt.get(email, req.user.id);
      if (emailExists) {
        return res.status(400).json({
          error: true,
          data: { message: 'Email is already in use' }
        });
      }
      sqlSetParts.push("email = ?");
      sqlParams.push(email);
    }

    // Make sure the new username is not already in use
    if (username) {
      const checkUsernameStmt = db.prepare('SELECT id FROM Users WHERE username = ? AND id != ?');
      const usernameExists = checkUsernameStmt.get(username, req.user.id);
      if (usernameExists) {
        return res.status(400).json({
          error: true,
          data: { message: 'Username is already taken' }
        });
      }
      sqlSetParts.push("username = ?");
      sqlParams.push(username);
      }

    // If a password is provided, hash it and update the user's password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sqlSetParts.push("hashedPassword = ?");
      sqlParams.push(hashedPassword);
    }

    // Update the user's phone number
    if (phone) {
      sqlSetParts.push("phone = ?");
      sqlParams.push(phone);
    }

    // Update the user's home state
    if (homestate) {
      sqlSetParts.push("homestate = ?");
      sqlParams.push(homestate);
    }

    // Update interests by first clearing existing entries and then inserting new ones
    if (interests && interests.length > 0) {
      const preparedDeleteStmt = db.prepare('DELETE FROM userInterests WHERE user_id = ?');
      preparedDeleteStmt.run([req.user.id]);
      for (const interestName of interests) {
        const preparedInterestStmt = db.prepare('SELECT id FROM Interests WHERE name = ?');
        const interestIdResult = preparedInterestStmt.get(interestName);
        if (!interestIdResult) {
          return res.status(400).json({
            error: true,
            data: { message: `Interest not found: ${interestName}` }
          });
        }
        const insertInterestStmt = db.prepare('INSERT INTO userInterests (user_id, interest_id) VALUES (?, ?)');
        insertInterestStmt.run([req.user.id, interestIdResult.id]);
      }
    }

    // If there are any fields to update, update the user
    if (sqlSetParts.length > 0) {
      const sqlQuery = `
        UPDATE Users 
        SET ${sqlSetParts.join(", ")}
        WHERE id = ?
      `;
      sqlParams.push(req.user.id);

      const updateUserStmt = db.prepare(sqlQuery);
      updateUserStmt.run(sqlParams);
    }

    return res.json({
      error: false,
      data: { message: 'User updated successfully' }
    });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      error: true,
      data: {
        message: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
        }
    });
  }
});
module.exports = router;