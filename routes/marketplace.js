const express = require("express");
const router = express.Router();

const {  listItem} = require("../logic/marketplaceLogic");

router.post("/listItem", async (req, res) => {
    const { nftContract, tokenId, paymentToken, seller, price, txSalt, signature } = req.body;

    let addItem = await listItem(nftContract, tokenId, paymentToken, seller, price, txSalt, signature)
        .catch((err) => res.json(err.message));
    
    res.json(addItem);
});