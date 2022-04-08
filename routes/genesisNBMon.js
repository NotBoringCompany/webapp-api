const express = require("express");
const router = express.Router();

const genesisLogic = require("../logic/genesisNBMonLogic");

router.get("/getGenesisNBMon/:id", async (req, res) => {
	let id = req.params.id;
	let nbmon = await genesisLogic
		.getGenesisNBMon(id)
		.catch((err) => res.json(err.message));
	res.json(nbmon);
});

router.get("/getOwnerGenesisNBMonIDs/:address", async (req, res) => {
	let address = req.params.address;
	let ownerIds = await genesisLogic
		.getOwnerGenesisNBMonIDs(address)
		.catch((err) => res.json(err.message));
	res.json(ownerIds);
});

router.get("/getOwnerGenesisNBMons/:address", async (req, res) => {
	let address = req.params.address;
	let nbmons = await genesisLogic
		.getOwnerGenesisNBMons(address)
		.catch((err) => res.json(err.message));
	res.json(nbmons);
});

module.exports = router;
