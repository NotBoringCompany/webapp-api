const express = require("express");
const router = express.Router();

const genesisMintingLogic = require("../logic/genesisNBMonMintingLogic");
const { isWhitelistMintingTime } = require("../middlewares/mintingTime");
const { paymentReceived } = require("../middlewares/requirePayment");

router.get(
	"/whitelistedMint/:address/:transactionHash",
	paymentReceived,
	isWhitelistMintingTime,
	async (req, res) => {
		let address = req.params.address;
		let whitelistedMint = await genesisMintingLogic
			.whitelistedMint(address)
			.catch((err) => res.json(err.message));
		res.json(whitelistedMint);
	}
);

router.post("/publicMint", async (req, res) => {
	const { address } = req.body;

	let publicMint = await genesisMintingLogic
		.publicMint(address)
		.catch((err) => res.json(err.message));
	res.json(publicMint);
});

module.exports = router;
