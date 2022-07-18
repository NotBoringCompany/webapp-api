const express = require("express");
const router = express.Router();

const genesisMintingLogic = require("../logic/genesisNBMonMintingLogic");
const {
	isWhitelistMintingTime,
	isPublicMintingTime,
	mintingTimeNotClosed,
} = require("../middlewares/mintingTime");
const { paymentReceived } = require("../middlewares/requirePayment");
const httpErrorStatusCode = require("../utils/httpErrorStatusCode");

router.post(
	"/whitelistedMint",
	paymentReceived,
	isWhitelistMintingTime,
	mintingTimeNotClosed,
	async (req, res) => {
		try {
			const { purchaserAddress } = req.body;

			let whitelistedMint = await genesisMintingLogic.whitelistedMint(
				purchaserAddress
			);
			res.json(whitelistedMint);
		} catch (error) {
			res.status(httpErrorStatusCode(error.code)).json({ error });
		}
	}
);

router.post(
	"/publicMint",
	paymentReceived,
	isPublicMintingTime,
	mintingTimeNotClosed,
	async (req, res) => {
		try {
			const { purchaserAddress } = req.body;

			let publicMint = await genesisMintingLogic.publicMint(purchaserAddress);

			res.json(publicMint);
		} catch (error) {
			res.status(httpErrorStatusCode(error.code)).json({ error });
		}
	}
);

module.exports = router;
