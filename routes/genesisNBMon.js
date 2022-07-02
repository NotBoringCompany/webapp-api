const express = require("express");
const router = express.Router();

const genesisLogic = require("../logic/genesisNBMonLogic");
const httpErrorStatusCode = require("../utils/httpErrorStatusCode");

router.get("/getGenesisNBMon/:id", async (req, res) => {
	try {
		let id = req.params.id;
		let nbmon = await genesisLogic.getGenesisNBMon(id).catch((err) => {
			throw err;
		});
		res.json(nbmon);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/getOwnerGenesisNBMonIDs/:address", async (req, res) => {
	try {
		let address = req.params.address;
		let ownerIds = await genesisLogic
			.getOwnerGenesisNBMonIDs(address)
			.catch((err) => {
				throw err;
			});
		res.json(ownerIds);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/getOwnerGenesisNBMons/:address", async (req, res) => {
	try {
		let address = req.params.address;
		let nbmons = await genesisLogic
			.getOwnerGenesisNBMons(address)
			.catch((err) => {
				throw err;
			});
		res.json(nbmons);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/config/:address", async (req, res) => {
	try {
		let address = req.params.address;
		let config = await genesisLogic.config(address).catch((err) => {
			throw err;
		});
		res.json(config);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/config", async (_, res) => {
	try {
		let config = await genesisLogic.generalConfig().catch((err) => {
			throw err;
		});
		res.json(config);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

router.get("/getTypes/:genus", async (req, res) => {
	try {
		let genus = req.params.genus;
		let types = await genesisLogic.getGenesisNBMonTypes(genus).catch((err) => {
			throw err;
		});
		res.json(types);
	} catch (error) {
		res.status(httpErrorStatusCode(error.code)).json({ error });
	}
});

module.exports = router;
