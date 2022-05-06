const express = require("express");
const router = express.Router();

const {
	sendPasswordResetRequest,
	checkIfTokenValid,
	resetPassword,
} = require("../logic/acccountLogic");

router.post("/send-reset-password-request", async (req, res) => {
	const { email } = req.body;

	try {
		let result = await sendPasswordResetRequest(email).catch((error) => {
			return { error: error.message };
		});
		res.json(result);
	} catch (error) {
		res.status(400).json({ error });
	}
});

router.get("/password-token-check/:token", async (req, res) => {
	const { token } = req.params;
	let result = await checkIfTokenValid(token).catch((err) =>
		res.json(err.message)
	);
	if (result.valid) {
		return res.json({ valid: true });
	}
	res.status(404).json({ valid: false });
});

router.post("/reset-password", async (req, res) => {
	const { tokenId, newPassword, confirmNewPassword } = req.body;
	try {
		let result = await resetPassword(tokenId, newPassword, confirmNewPassword);
		res.json(result);
	} catch (error) {
		res.status(400).json({ error });
	}
});

module.exports = router;
