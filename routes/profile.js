const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { db } = require("../utils/database.js");
const { validateFields } = require("../middleware/validate.js");
const { profileSchema } = require("../schemas/profile.js");
const { authenticateAccessToken } = require("../middleware/auth.js");


/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves user profile information, including badges, gems, and interests.
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
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
 *                   properties:
 *                     id:
 *                       type: number
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     homestate:
 *                       type: string
 *                     badges:
 *                       type: array
 *                     gems:
 *                       type: array
 *                     interests:
 *                       type: array
 *                     gemsFound:
 *                       type: number
 *                     badgesFound:
 *                       type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateAccessToken, async (req, res) => {
  const getUserStmt = db.prepare('SELECT id, username, email, phone, homestate FROM Users WHERE id = ?');
  
  const getUserBadgesStmt = db.prepare(`SELECT b.name, b.description, b.static_image_url FROM Badges b JOIN UserBadges ub ON b.id = ub.badge_id WHERE ub.user_id = ?`);
  const getUserGemsStmt = db.prepare(`SELECT g.city, g.state, g.description FROM Gems g JOIN UserGems ug ON g.id = ug.gem_id WHERE ug.user_id = ?`);
  const getUserInterestsStmt = db.prepare(`SELECT i.name FROM Interests i JOIN UserInterests ui ON i.id = ui.interest_id WHERE ui.user_id = ?`);

  try {
    let user = getUserStmt.get(req.user.id);
    user.badges = getUserBadgesStmt.all(req.user.id);
    user.interests = getUserInterestsStmt.all(req.user.id);
    user.gems = getUserGemsStmt.all(req.user.id);
    user.gemsFound = user.gems.length;
    user.badgesFound = user.badges.length;
    user.citiesFound = 0;
    user.statesFound = 0;
    user.profilePictureBlob = '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';
    return res.json({ error: false, data: user});
  } catch (error) {
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

    if (oldPassword) {
      // Make sure the old password is correct, otherwise fail to update
      if (!bcrypt.compareSync(oldPassword, user.hashedPassword)) {
        return res.status(400).json({
          error: true,
          data: { message: 'Old password is incorrect' }
        }); 
      }
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
    } else {
      return res.status(400).json({
        error: true,
        data: { message: 'No fields to update' }
      });
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