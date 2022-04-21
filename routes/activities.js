const express = require("express");
const router = express.Router();
const { getUserActivities } = require("../logic/activities");
router.get("/:address", async (req, res) => {
	const { address } = req.params;
	let activities = await getUserActivities(address).catch((err) =>
		res.json(err)
	);
	res.json(activities);
});

module.exports = router;
