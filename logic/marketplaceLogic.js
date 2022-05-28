const Moralis = require("moralis/node");
const crypto = require("crypto");

/// @dev Currently this API only focuses on the genesis NBMon contract. once refactored, it should have flexibility to list all the items on sale 
/// for different contracts.

// gets all items currently on sale
const getItemsOnSale = async () => {
    try {
        const query = new Moralis.Query("ItemsOnSale");
        const queryPipeline = [
            { match: {} },
            { project: {
                _id: 0,
                NFT_Contract: 1,
                Token_ID: 1,
                Payment_Token: 1,
                Seller: 1,
                Price: 1,
                TX_Salt: 1,
                Signature: 1
            } }
        ];

        const queryPipelineAggRes = await query.aggregate(queryPipeline);
        return queryPipelineAggRes;
    } catch (err) {
        throw new Error(err.stack);
    }
}

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
    txSalt,
    addItemOnSale,
    deleteItemOnSale,
    getItemsOnSale
};