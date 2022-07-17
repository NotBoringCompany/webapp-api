const express = require("express");
const {
	randomizeHatchingStats,
	generateSignature,
	getNBMonBornAt,
	updateHatchedNBMon,
} = require("../logic/genesisNBMonHatchingLogic");
const {
	uploadGenesisHatchedMetadata,
} = require("../logic/genesisMetadataLogic");
const router = express.Router();

router.post("/hatch", async (req, res) => {
	const { nbmonId } = req.body;
	try {
		const bornAt = await getNBMonBornAt(nbmonId);

		const { signature, txSalt } = await generateSignature(
			nbmonId,
			process.env.ADMIN_ADDRESS,
			bornAt
		).catch((err) => {
			console.log("error at signature");
            throw new Error(err);
		});

		const rand = await randomizeHatchingStats(nbmonId, txSalt, signature).catch(
			(err) => {
                console.log("error at rand");
				throw new Error(err);
			}
		);

		res.json({
			signature,
			txSalt,
		});
	} catch (e) {
		res.json({ e: e.toString() });
	}
});

//TODO: DELETE THIS ROUTE LATER :)
router.post("/randomizeHatchingStats", async (req, res) => {
	let randomizeStats = await randomizeHatchingStats().catch((err) =>
		res.json(err)
	);
	res.json(randomizeStats);
});

router.post("/uploadHatchedMetadata", async (req, res) => {
	const { nbmonId } = req.body;
	let upload = await uploadGenesisHatchedMetadata(nbmonId).catch((err) =>
		res.json(err)
	);
	res.json(upload);
});

router.post("/updateHatchedNBMon", async (req, res) => {
	const {id} = req.body;

	let updateNBMon = await updateHatchedNBMon(id)
		.catch((err) => res.json(err.message));

	res.json(updateNBMon);
})

module.exports = router;
