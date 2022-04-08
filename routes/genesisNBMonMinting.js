const express = require("express");
const router = express.Router();

const genesisMintingLogic = require("../logic/genesisNBMonMintingLogic");
const mintingTimeAuth = require("../middlewares/mintingTime");

router.get("/whitelistedMint/:address", mintingTimeAuth.isWhitelistMintingTime, async (req, res) => {
    let address = req.params.address;
    let whitelistedMint = await genesisMintingLogic
        .whitelistedMint(address)
        .catch((err) => res.json(err.message));
    res.json(whitelistedMint);
})

router.get("/publicMint/:address", mintingTimeAuth.isPublicMintingTime,async (req, res) => {
    let address = req.params.address;
    let publicMint = await genesisMintingLogic
        .publicMint(address)
        .catch((err) => res.json(err.message));
    res.json(publicMint);
})

module.exports = router;