const express = require("express");
const router = express.Router();
const crypto = require("crypto");
var { clean, getUserIDBySessionToken } = require("../utils/helper.js");

// Call for user login
router.post("/login/:strUserName/:strPassword", async (req, res) => {
	const dbConnection = await db_pool.getConnection();
	const { strUserName, strPassword } = req.params;

	var strHashedPassword = crypto.createHash("sha256").update(strPassword).digest("hex");
	console.log("Got a login attempt from " + strUserName + ", communicating with DB...");

	try {
		var usersQuery = await dbConnection.query("SELECT * FROM tblUser WHERE UserName=? AND password=?;", [strUserName, strHashedPassword]);

		if (usersQuery.length == 0) {
			console.error("Failed login attempt for user " + strUserName);
			return res.status(400).json({ "message": "Incorrect or missing email/password." });
		}

		console.info("Successful login for user " + strUserName);

		var uuidSessionToken = crypto.randomUUID();
		console.log("User " + strUserName + "'s session token is " + uuidSessionToken);

		res.status(200).json({ "message": "Success. Logging you in.", "uuidSessionToken": uuidSessionToken });

		const intUserId = usersQuery[0].EmployeeID;

		await dbConnection.query("INSERT INTO tblSessions (UserID, ID, timeIn) VALUE (?, ?, NOW());", [intUserId, uuidSessionToken]);
	} finally {
		await dbConnection.end();
	}
});

// Call for user logout
router.delete("/logout/:uuidSessionToken", async (req, res) => {
	const dbConnection = await db_pool.getConnection();
	const uuidSessionToken = clean(req.params.uuidSessionToken);

	try { // Checks to see if user is logged in correctly
		var userID = await getUserIDBySessionToken(uuidSessionToken);
		if (userID == -1) {
			return res.status(400).json({ "message": "You must be logged in to do that" });
		}

		console.log("Session token " + uuidSessionToken + " wants to log out.");

		await dbConnection.query("DELETE FROM tblSessions where ID=?;", [uuidSessionToken]);

		res.status(200).json({ "message": "Goodbye!" });
	} finally {
		await dbConnection.close();
	}
});

module.exports = router;