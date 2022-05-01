const express = require("express");
const { randomizeHatchingStats } = require("../logic/genesisNBMonHatchingLogic");
const { uploadGenesisHatchedMetadata } = require("../logic/genesisMetadataLogic");
const router = express.Router();

router.post("/randomizeHatchingStats", async (_, res) => {
    let randomizeStats = await randomizeHatchingStats().catch((err) => res.json(err));
    res.json(randomizeStats);
});

router.post("/uploadHatchedMetadata", async (req, res) => {
    const { nbmonId } = req.body;
    let upload = await uploadGenesisHatchedMetadata(nbmonId).catch((err) => res.json(err));
    res.json(upload);
})

module.exports = router;