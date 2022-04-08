const express = require("express");
const router = express.Router();

const genesisMintingLogic = require("../logic/genesisNBMonMintingLogic");

const { publicMintTime } = require("../middlewares/timeCheckers");

router.get("/whitelistedMint/:address", async (req, res) => {
	let address = req.params.address;
	let whitelistedMint = await genesisMintingLogic
		.whitelistedMint(address)
		.catch((err) => res.json(err.message));
	res.json(whitelistedMint);
});

/**
 * @route GET genesisNBMonMinting/publicMint/:address
 * @desc Public minting route. The publicMintTime is a middleware to check if the public minting is currently open. To add more middleware simply add it in the array
 * @access Private - requires auth
 **/

router.get("/publicMint/:address", [publicMintTime], async (req, res) => {
	let address = req.params.address;
	let publicMint = await genesisMintingLogic
		.publicMint(address)
		.catch((err) => res.json(err.message));
	res.json(publicMint);
});
module.exports = router;
