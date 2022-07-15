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
// ----------------------------------------------------------------

const {getGenesisNBMon} = require('./genesisNBMonLogic');
const nbmonContract = process.env.CONTRACT_ADDRESS;

/**
 * @dev Helper function to parse object data into a JSON string
 */
 const parseJSON = (data) => JSON.parse(JSON.stringify(data));

/**
 * Lists item up for sale.
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
    endTime, 
    txSalt, 
    signature
    ) => {

    const ItemsOnSale = Moralis.Object.extend("ItemsOnSale");
    const itemsOnSale = new ItemsOnSale();

    itemsOnSale.set("NFT_Contract", nftContract);
    itemsOnSale.set("Sale_Type", saleType);
    itemsOnSale.set("Starting_Price", startingPrice);
    itemsOnSale.set("Minimum_Reserve_Bid", minimumReserveBid);

    //calculating duration
    const duration = endTime - moment.unix();
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

// gets a 256-byte salt, used inside listingHash when listing an item on sale.
const generateTxSalt = () => {
    return crypto.randomBytes(256).toString('hex');
}

//gets all items currently on sale
const getItemsOnSale = async () => {
    try {
        const ItemsOnSale = Moralis.Object.extend("ItemsOnSale");
        const query = new Moralis.Query(ItemsOnSale);
        const queryResult = await query.find({ useMasterKey: true });

        const parsedResult = parseJSON(queryResult);

        let resultObject = [];

        // if nft contract is the nbmon contract, we then fetch the nbmon stats of the nbmon on sale
        for (let i = 0; i < parsedResult.length; i++) {
            if (parsedResult[i]["NFT_Contract"] === nbmonContract) {
                parsedResult[i]["NBMon Data"] = await getGenesisNBMon(parsedResult[i]["Token_ID"]);
                resultObject[`NBMon ID ${parsedResult[i]["Token_ID"]}`] = parsedResult[i];
            } else {
                resultObject[`NFT ID ${parsedResult[i]["Token_ID"]}`] = parsedResult[i];
            }
        }

        return resultObject;
    } catch (err) {
        throw new Error(err.stack);
    }
}

//get a single item on sale
const getItemOnSale = async (tokenId) => {
    try {
        const ItemsOnSale = Moralis.Object.extend("ItemsOnSale");
        const query = new Moralis.Query(ItemsOnSale);
        const idQuery = query.equalTo("Token_ID", tokenId);
        const queryResult = await idQuery.find({ useMasterKey: true });

        const parsedResult = parseJSON(queryResult);

        let resultObject = [];
        // if nft contract is the nbmon contract, we then fetch the nbmon stats of the nbmon on sale
        if (parsedResult[0]["NFT_Contract"] === nbmonContract) {
            parsedResult[0]["NBMon Data"] = await getGenesisNBMon(parsedResult[0]["Token_ID"]);
            resultObject[`NBMon ID ${parsedResult[0]["Token_ID"]}`] = parsedResult[0];
        } else {
            resultObject[`NFT ID ${parsedResult[0]["Token_ID"]}`] = parsedResult[0];
        }
        
        return resultObject;

    } catch (err) {
        throw new Error(err.stack);
    }
}

// deletes an item after being sold or cancelled.
const deleteItemOnSale = async (tokenId) => {
    try {
        const itemsQuery = new Moralis.Query("ItemsOnSale");
        itemsQuery.equalTo("Token_ID", tokenId);
        const item = await itemsQuery.first({ useMasterKey: true });

        if (item) {
            item.destroy({ useMasterKey: true }).then(() => {
                return `ID ${tokenId} deleted from ItemsOnSale`;
            }), (err) => {
                throw new Error(err.stack);
            }
        }
    } catch (err) {
        throw new Error(err.stack);
    }
}

module.exports = {
    listItem,
    getItemsOnSale,
    generateTxSalt,
    deleteItemOnSale,
    getItemOnSale
};