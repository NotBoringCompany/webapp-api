const express = require("express");
const router = express.Router();

const genesisLogic = require("../logic/genesisNBMonLogic");
const httpErrorStatusCode = require("../utils/httpErrorStatusCode");

router.get("/getGenesisNBMon/:id", async (req, res) => {
	try {
		let id = req.params.id;
		let nbmon = await genesisLogic
			.getGenesisNBMon(parseInt(id))
			.catch((err) => {
				throw err;
			});
		res.json(nbmon);
	} catch (error) {
		res
			.status(httpErrorStatusCode(error.code))
			.json({ error: error.toString() });
	}
});

router.get("/getOwnerGenesisNBMonIDs/:address", async (req, res) => {
	try {
		let address = req.params.address;
		let ownerIds = await genesisLogic.getOwnerGenesisNBMonIDs(address);

		res.json(ownerIds);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/getOwnerGenesisNBMons/:address", async (req, res) => {
	try {
		let address = req.params.address;
		let nbmons = await genesisLogic.getOwnerGenesisNBMons(address);

		res.json(nbmons);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/config/:address", async (req, res) => {
	try {
		let address = req.params.address;
		let config = await genesisLogic.config(address);
		res.json(config);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/config", async (_, res) => {
	try {
		let config = await genesisLogic.generalConfig();
		res.json(config);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/getTypes/:genus", async (req, res) => {
	try {
		let genus = req.params.genus;
		let types = await genesisLogic.getGenesisNBMonTypes(genus);
		res.json(types);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

module.exports = router;
