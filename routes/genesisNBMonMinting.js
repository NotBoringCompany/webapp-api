const express = require("express");
const router = express.Router();

const genesisMintingLogic = require("../logic/genesisNBMonMintingLogic");
const mintingTimeAuth = require("../middlewares/mintingTime");
const requirePaymentAuth = require("../middlewares/requirePayment");

router.get(
    "/whitelistedMint/:address/:transactionHash", 
    requirePaymentAuth.paymentReceived, 
    mintingTimeAuth.isWhitelistMintingTime, 
    async (req, res) => 
    {
        let address = req.params.address;
        let whitelistedMint = await genesisMintingLogic
            .whitelistedMint(address)
            .catch((err) => res.json(err.message));
        res.json(whitelistedMint);
})

router.get(
    "/publicMint/:address/:transactionHash", 
    requirePaymentAuth.paymentReceived, 
    mintingTimeAuth.isPublicMintingTime, 
    async (req, res) => {
        let address = req.params.address;
        let publicMint = await genesisMintingLogic
            .publicMint(address)
            .catch((err) => res.json(err.message));
        res.json(publicMint);
})

module.exports = router;