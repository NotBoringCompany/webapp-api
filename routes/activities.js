const express = require("express");
const router = express.Router();
const { getUserActivities, addToActivities } = require("../logic/activities");
router.get("/:address", async (req, res) => {
	const { address } = req.params;
	let activities = await getUserActivities(address).catch((err) =>
		res.json(err)
	);
	res.json(activities);
});

router.get("/test/:hash", async (req, res) => {
	const { hash } = req.params;
	try {
		let ethNftTransfer = await addToActivities(
			hash,
			"genesisMinting",
			"eth",
			process.env.MINTING_PRICE
		).catch((err) => res.json(err.message));
		res.json(ethNftTransfer);
	} catch (e) {
		return res.status(400).json({ status: `err ${e}` });
	}
});
module.exports = router;
