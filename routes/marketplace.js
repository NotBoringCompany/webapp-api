const express = require("express");
const router = express.Router();

const { getItemsOnSale, generateTxSalt, addItemOnSale, deleteItemOnSale } = require("../logic/marketplaceLogic");

router.get("/getItemsOnSale", async (_, res) => {
    let items = await getItemsOnSale().catch((err) => res.json(err.message));
    res.json(items);
});

router.post("/generateTxSalt", async (_, res) => {
    let txSalt = await generateTxSalt().catch((err) => res.json(err.message));
    res.json(txSalt);
});

router.post("/addItemOnSale", async (req, res) => {
    const { tokenId, paymentToken, seller, price, txSalt, signature } = req.body;

    let addItem = await addItemOnSale(tokenId, paymentToken, seller, price, txSalt, signature)
        .catch((err) => res.json(err.message));
    
    res.json(addItem);
});

router.post("/deleteItemOnSale", async (req, res) => {
    let { tokenId } = req.body;

    let deleteItem = await deleteItemOnSale(tokenId).catch((err) => res.json(err.message));
    res.json(deleteItem);
})