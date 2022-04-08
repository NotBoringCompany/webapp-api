const express = require("express");
const router = express.Router();

const genesisMintingLogic = require("../logic/genesisNBMonMintingLogic");

router.get("/whitelistedMint/:address", async (req, res) => {
    let address = req.params.address;
    let whitelistedMint = await genesisMintingLogic
        .whitelistedMint(address)
        .catch((err) => res.json(err.message));
    res.json(whitelistedMint);
})

router.get("/publicMint/:address", async (req, res) => {
    let address = req.params.address;
    let publicMint = await genesisMintingLogic
        .publicMint(address)
        .catch((err) => res.json(err.message));
    res.json(publicMint);
})
module.exports = router;