require('dotenv').config();
const Moralis = require("moralis/node");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const query = require('express/lib/middleware/query');

const moralisAPINode = process.env.MORALIS_APINODE;
const pvtKey = process.env.PRIVATE_KEY_1;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const genesisNBMonABI = fs.readFileSync(
	path.resolve(__dirname, "../abi/genesisNBMon.json")
);
const genesisABI = JSON.parse(genesisNBMonABI);
const genesisContract = new ethers.Contract(
	process.env.CONTRACT_ADDRESS,
	genesisABI,
	customHttpProvider
);


/// @dev Currently this API only focuses on the genesis NBMon contract. once refactored, it should have flexibility to list all the items on sale 
/// for different contracts.

// gets a 256-byte salt, used inside listingHash when listing an item on sale.
const txSalt = () => {
    console.log(crypto.randomBytes(256).toString('hex'));
}

// adds an item on sale and store it to Moralis, along with the txSalt and signature.
const addItemOnSale = async (
    tokenId,
    paymentToken,
    seller,
    price,
    txSalt,
    signature
) => {
    const ItemsOnSale = Moralis.Object.extend("ItemsOnSale");
    const itemsOnSale = new ItemsOnSale();

    itemsOnSale.set("NFT_Contract", "0xb0D9C83F3116f7c8f88Ae42f435b92CE8174162a");
    itemsOnSale.set("Token_ID", tokenId);
    itemsOnSale.set("Payment_Token", paymentToken);
    itemsOnSale.set("Seller", seller);
    itemsOnSale.set("Price", price);
    itemsOnSale.set("TX_Salt", txSalt);
    itemsOnSale.set("Signature", signature);
    
    itemsOnSale.save({useMasterKey: true}).then(
        (item) => {
            return `Item ${item} added for sale with token ID ${tokenId} for GenesisNBMon`
        }, (err) => {
            throw new Error(err.stack);
        }
    );
}

// deletes an item after being sold or cancelled.
const deleteItemOnSale = async (tokenId) => {
    try {
        const serverUrl = process.env.MORALIS_SERVERURL;
        const appId = process.env.MORALIS_APPID;
        const masterKey = process.env.MORALIS_MASTERKEY;

        await Moralis.start({ serverUrl, appId, masterKey });
        
        const query = new Moralis.Query("ItemsOnSale");
        query.equalTo("Token_ID", tokenId);
        const item = await query.first({ useMasterKey: true });

        if (item) {
            item.destroy({ useMasterKey: true }).then(() => {
                console.log(`ID ${tokenId} deleted from ItemsOnSale`);
            }), (err) => {
                console.log(err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

deleteItemOnSale(2);

module.exports = {
    txSalt,
    addItemOnSale,
    deleteItemOnSale
};