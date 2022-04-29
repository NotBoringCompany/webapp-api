const express = require("express");
const router = express.Router();

const genesisMintingLogic = require("../logic/genesisNBMonMintingLogic");
const {
	isWhitelistMintingTime,
	isPublicMintingTime,
	mintingTimeNotClosed,
} = require("../middlewares/mintingTime");
const { paymentReceived } = require("../middlewares/requirePayment");

router.post(
	"/whitelistedMint",
	// paymentReceived,
	// isWhitelistMintingTime,
	// mintingTimeNotClosed,
	async (req, res) => {
		const { purchaserAddress } = req.body;

		let whitelistedMint = await genesisMintingLogic
			.whitelistedMint(purchaserAddress)
			.catch((err) => res.json(err.message));
		res.json(whitelistedMint);
	}
);

router.post(
	"/publicMint",
	// paymentReceived,
	// isPublicMintingTime,
	// mintingTimeNotClosed,
	async (req, res) => {
		const { purchaserAddress } = req.body;

		let publicMint = await genesisMintingLogic
			.publicMint(purchaserAddress)
			.catch((err) => res.json(err.message));
		res.json(publicMint);
	}
);

module.exports = router;
