const express = require("express");
const { randomizeHatchingStats } = require("../logic/genesisNBMonHatchingLogic");
const router = express.Router();

router.post("/randomizeHatchingStats", async (_, res) => {
    let randomizeStats = await randomizeHatchingStats().catch((err) => res.json(err));
    res.json(randomizeStats);
});

module.exports = router;