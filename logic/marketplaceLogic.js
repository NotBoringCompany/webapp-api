const Moralis = require("moralis/node");
const crypto = require("crypto");

// ----------------------------------------------------------------
// NOTE: SECURITY MIDDLEWARE IS NEEDED FOR ALL REQUIRED FUNCTIONS. TO BE IMPLEMENTED.
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// ONLY FOR TESTING PURPOSES
    require('dotenv').config();
    const serverUrl = process.env.MORALIS_SERVERURL;
    const appId = process.env.MORALIS_APPID;
    const masterKey = process.env.MORALIS_MASTERKEY;
    await Moralis.start({ serverUrl, appId, masterKey });
// ----------------------------------------------------------------

/**
 * @dev Lists item up for sale.
 * @param {nftContract} The contract address of the NFT being listed on sale.
 * @param {paymentToken} The contract address of the payment token the seller chose for listing the item.
 * @param {signature} The signature of the seller. Please use `listingHash` to obtain the signature.
 */
const listItem = async (
    nftContract, 
    tokenId, 
    paymentToken, 
    saleType, 
    seller, 
    price, 
    startingPrice, 
    endingPrice, 
    minimumReserveBid, 
    duration, 
    txSalt, 
    signature
    ) => {

    const ItemsOnSale = Moralis.Object.extend("ItemsOnSale");
    const itemsOnSale = new ItemsOnSale();

    itemsOnSale.set("NFT_Contract", nftContract);
    itemsOnSale.set("Sale_Type", saleType);
    itemsOnSale.set("Starting_Price", startingPrice);
    itemsOnSale.set("Minimum_Reserve_Bid", minimumReserveBid);
    itemsOnSale.set("Duration", duration);
    itemsOnSale.set("Ending_Price", endingPrice);
    itemsOnSale.set("Token_ID", tokenId);
    itemsOnSale.set("Payment_Token", paymentToken);
    itemsOnSale.set("Seller", seller);
    itemsOnSale.set("Price", price);
    itemsOnSale.set("TX_Salt", txSalt);
    itemsOnSale.set("Signature", signature);

    itemsOnSale.save(null, {useMasterKey: true}).then(
        (item) => {
            return `Item ${item} added for sale with token ID ${tokenId} for GenesisNBMon`
        }, (err) => {
            throw new Error(err.stack);
        }
    );
}

// gets all items currently on sale
// const getItemsOnSale = async () => {
//     try {
//         const query = new Moralis.Query("ItemsOnSale");
//         const queryPipeline = [
//             { match: {} },
//             { project: {
//                 _id: 0,
//                 NFT_Contract: 1,
//                 Token_ID: 1,
//                 Payment_Token: 1,
//                 Seller: 1,
//                 Price: 1,
//                 TX_Salt: 1,
//                 Signature: 1
//             } }
//         ];

//         const queryPipelineAggRes = await query.aggregate(queryPipeline);
//         return queryPipelineAggRes;
//     } catch (err) {
//         throw new Error(err.stack);
//     }
// }

// // gets a 256-byte salt, used inside listingHash when listing an item on sale.
// const generateTxSalt = () => {
//     return crypto.randomBytes(256).toString('hex');
// }


// // deletes an item after being sold or cancelled.
// const deleteItemOnSale = async (tokenId) => {
//     try {
//         const itemsQuery = new Moralis.Query("ItemsOnSale");
//         itemsQuery.equalTo("Token_ID", tokenId);
//         const item = await itemsQuery.first({ useMasterKey: true });

//         if (item) {
//             item.destroy({ useMasterKey: true }).then(() => {
//                 return `ID ${tokenId} deleted from ItemsOnSale`;
//             }), (err) => {
//                 throw new Error(err.stack);
//             }
//         }
//     } catch (err) {
//         throw new Error(err.stack);
//     }
// }


module.exports = {
    listItem
};