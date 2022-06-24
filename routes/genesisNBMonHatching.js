const express = require("express");
const {
	randomizeHatchingStats,
	generateSignature,
	getNBMonBornAt,
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
			throw new Error(err);
		});

		// const rand = await randomizeHatchingStats(nbmonId, txSalt, signature).catch(
		// 	(err) => {
		// 		throw new Error(err);
		// 	}
		// );

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

module.exports = router;
