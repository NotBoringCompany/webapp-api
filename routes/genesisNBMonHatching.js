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
const { paymentReceived } = require("../middlewares/requirePayment");
const router = express.Router();

router.post("/hatch", paymentReceived, async (req, res) => {
	const { nbmonId } = req.body;
	try {
		const bornAt = await getNBMonBornAt(parseInt(nbmonId));

		//Generates Signature and TxSalt
		const { signature, txSalt } = await generateSignature(
			parseInt(nbmonId),
			process.env.ADMIN_ADDRESS,
			bornAt
		).catch((err) => {
			throw new Error(err);
		});

		//Randomises stats and send it to the blockchain as a
		//key-value pair where key is the signature, and value is the stats.
		await randomizeHatchingStats(parseInt(nbmonId), txSalt, signature).catch((err) => {
			throw new Error(err);
		});

		res.json({
			signature,
		});
	} catch (e) {
		res.json({ e: e.toString() });
	}
});

router.post("/uploadHatchedMetadata", async (req, res) => {
	const { nbmonId } = req.body;
	let upload = await uploadGenesisHatchedMetadata(parseInt(nbmonId)).catch((err) =>
		res.json(err)
	);
	res.json(upload);
});

router.post("/updateHatchedNBMon", async (req, res) => {
	const {id} = req.body;

	let updateNBMon = await updateHatchedNBMon(parseInt(id))
		.catch((err) => res.json(err.message));

	res.json(updateNBMon);
})

module.exports = router;
