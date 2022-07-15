const express = require("express");
const router = express.Router();

const {  listItem, getItemsOnSale, getItemOnSale, generateTxSalt, deleteItemOnSale } = require("../logic/marketplaceLogic");

router.post("/listItem", async (req, res) => {
    const { 
        nftContract, 
        tokenId, 
        paymentToken, 
        seller, 
        price, 
        txSalt, 
        signature, 
        saleType, 
        startingPrice, 
        endingPrice, 
        minimumReserveBid, 
        duration 
    } = req.body;

    let addItem = await listItem(
        nftContract, 
        tokenId, 
        paymentToken, 
        seller, 
        price, 
        txSalt, 
        signature, 
        saleType, 
        startingPrice, 
        endingPrice, 
        minimumReserveBid, 
        duration
        )
        .catch((err) => res.json(err.message));
    
    res.json(addItem);
});

router.get("/getItems", async (_, res) => {
    let items = await getItemsOnSale()
        .catch((err) => res.json(err.message));

    res.json(items);
});

router.get("getItem", async (req, res) => {
    const { tokenId } = req.body;
    let item = await getItemOnSale(tokenId).catch((err) => res.json(err.message));

    res.json(item);
});

router.post("/generateTxSalt", async (_, res) => {
    let salt = generateTxSalt();

    res.json(salt);
});

router.post("/deleteItem", async (req, res) => {
    const {tokenId} = req.body;

    let deleteItem = await deleteItemOnSale(tokenId).catch((err) => res.json(err.message));

    res.json(deleteItem);
});

module.exports = router;