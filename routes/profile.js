const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { db } = require("../utils/database.js");
const { validateFields } = require("../middleware/validate.js");
const { registerSchema } = require("../schemas/profile.js");
const { authenticateAccessToken } = require("../middleware/auth.js");


/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
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
  const getUserStmt = db.prepare('SELECT id, username, name, email, phone, homestate, gemsFound FROM Users WHERE id = ?');
  
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


/**
 * @swagger
 * /profile/update:
 *   post:
 *     summary: Update user details
 *     description: Allows a user to update their email, username, password, name, phone number, homestate, and interests.
 *     tags: [Users]
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
 *                 example: "old@example.com"
 *               username:
 *                 type: string
 *                 example: "Sloppy Joe"
 *               oldPassword:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SloppyJoeRul3z!"
 *               name:
 *                 type: string
 *                 example: "John Doe"
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
 *         description: Validation error (e.g., email already in use, username taken, homestate invalid, interest not found)
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
 *                       example: "Email is already in use"
 *       404:
 *         description: User not found
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
 *                       example: "User not found"
 *       500:
 *         description: Internal server error
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
 *                       example: "Internal server error"
*/

router.post('/update', validateFields(registerSchema), authenticateAccessToken, async (req, res) => {
  const {email, username, oldPassword, password, name, phone, homestate, interests } = req.body;

  try {
      // Prepare dynamic SQL query and parameters based on provided fields
      let sqlSetParts = [];

      let sqlParams = [];
    
      // get user
      const user = db.prepare('SELECT * FROM Users WHERE id = ?').get(req.user.id);     

      // check if old password is correct
      if (!bcrypt.compareSync(oldPassword, user.hashedPassword)) {
         return res.status(400).json({
              error: true,
              data: { message: 'Old password is incorrect' }
          }); 
      }
      
      // check if new password is the same as the old password
      if (password && oldPassword == password) {
        return res.status(400).json({
          error: true,
          data: { message: 'New password cannot be the same as the old password' }
        });
      }

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

      if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          sqlSetParts.push("hashedPassword = ?");
          sqlParams.push(hashedPassword);
      }

      if (name) {
          sqlSetParts.push("name = ?");
          sqlParams.push(name);
      }

      if (phone) {
          sqlSetParts.push("phone = ?");
          sqlParams.push(phone);
      }

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