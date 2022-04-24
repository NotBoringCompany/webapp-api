const express = require("express");
const { randomizeHatchingStats } = require("../logic/genesisNBMonHatchingLogic");
const router = express.Router();

router.post("/hatchNBMon", async (_, res) => {
    let hatchNBMon = randomizeHatchingStats();
});

module.exports = router;