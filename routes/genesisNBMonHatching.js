const express = require("express");
const { randomizeHatchingStats } = require("../logic/genesisNBMonHatchingLogic");
const router = express.Router();

router.get("/randomizeHatchingStats", async (_, res) => {
    let randomizer = await randomizeHatchingStats().catch((err) => res.json(err));
    res.json(randomizer);
});

module.exports = router;