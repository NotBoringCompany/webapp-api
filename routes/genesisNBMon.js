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

module.exports = router;
