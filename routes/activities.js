const express = require("express");
const router = express.Router();
const {
	getUserActivities,
	addToActivities,
} = require("../logic/activitiesLogic");

router.get("/:address", async (req, res) => {
	const { address } = req.params;
	try {
		let activities = await getUserActivities(address);
		res.json(activities);
	} catch (error) {
		res.status(400).json({ error });
	}
});
router.post("/addHatchingActivity", async (req, res) => {
	const { hash } = req.body;
	try {
		let result = await addToActivities(hash, "genesisHatching", "eth", "0");
		res.json(result);
	} catch (error) {
		res.status(400).json({ error });
	}
});

module.exports = router;
