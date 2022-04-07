const express = require('express');
const router = express.Router();

const genesisMintingLogic = require('../logic/genesisNBMonMintingLogic');

router.get('/whitelistedMint/:address', async (req, res) => {
    let address = req.params.address;
    let whitelistedMint = await genesisMintingLogic.whitelistedMint(address).catch((err) => res.json(err.message));
    res.json(whitelistedMint);
})

module.exports = router;