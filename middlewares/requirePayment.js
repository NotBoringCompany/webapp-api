require('dotenv').config();
const ethers = require('ethers');

const moralisAPINode = process.env.MORALIS_APINODE;
const mintingPrice = process.env.MINTING_PRICE;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const paymentReceived = async (req, res, next) => {
    try {
        let txHash = req.params.transactionHash;
        let txReceipt = await customHttpProvider.getTransaction(txHash);
        if (txReceipt && txReceipt.blockNumber) {
            // ensures that the user has actually sent the correct amount (minting price) to proceed.
            if (txReceipt.value == mintingPrice) {
                console.log(txReceipt);
                next();
            } else {
                res.status(403).json({
                    errorMessage: "User has not sent the correct amount. Please pay the minting price."
                })
            }
        } else {
            // will not reach here anyway since if the transaction hash is invalid, it will directly catch an error.
            // this code is only for safety measures.
            res.status(403).json({
                errorMessage: "Transaction hash provided is either invalid or not minted yet. Please check again later."
            });
        }
    } catch (err) {
        res.status(403).json({
            errorMessageFromBackend: err.message,
            errorMessage: "Transaction hash provided is either invalid or not minted yet. Please check again later."
        });
    }
}

module.exports = { paymentReceived };