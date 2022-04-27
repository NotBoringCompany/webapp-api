const express = require("express");
const router = express.Router();
const {
	getUserActivities,
	addToActivities,
	saveHatchingKey,
} = require("../logic/activitiesLogic");

router.get("/:address", async (req, res) => {
	const { address } = req.params;
	let activities = await getUserActivities(address).catch((error) => {
		return { error: error.message };
	});
	res.json(activities);
});
router.post("/addHatchingActivity", async (req, res) => {
	const { hash } = req.body;

	let result = await addToActivities(hash, "genesisHatching", "eth", "0").catch(
		(error) => {
			return { error: error.message };
		}
	);

	res.json(result);
});

// router.post("/addKey", async (req, res) => {
// 	const { key } = req.body;

// 	let result = await saveHatchingKey(key).catch((error) => {
// 		return { error: error.message };
// 	});

// 	res.json(result);
// });
module.exports = router;
