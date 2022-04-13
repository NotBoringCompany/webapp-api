const express = require("express");
const router = express.Router();

const genesisMintingLogic = require("../logic/genesisNBMonMintingLogic");
const { isWhitelistMintingTime, isPublicMintingTime, mintingTimeNotClosed } = require("../middlewares/mintingTime");
const { paymentReceived } = require("../middlewares/requirePayment");

router.post(
	"/whitelistedMint",
	paymentReceived,
	isWhitelistMintingTime,
	mintingTimeNotClosed,
	async (req, res) => {
		const { address } = req.body;

		let whitelistedMint = await genesisMintingLogic
			.whitelistedMint(address)
			.catch((err) => res.json(err.message));
		res.json(whitelistedMint);
	}
);

router.post(
	"/publicMint",
	paymentReceived,
	isPublicMintingTime,
	mintingTimeNotClosed,
	async (req, res) => {
		const { address } = req.body;

		let publicMint = await genesisMintingLogic
			.publicMint(address)
			.catch((err) => res.json(err.message));
		res.json(publicMint);
});

module.exports = router;
