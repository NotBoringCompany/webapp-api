const ethers = require('ethers');

const moralisAPINode = process.env.MORALIS_APINODE;

// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const paymentReceived = async (req, res, next) => {
    let txHash = req.params.transactionHash;
    let txReceipt = await customHttpProvider.getTransaction(txHash);
    if (txReceipt && txReceipt.blockNumber) {
        // ensures that the user has actually sent 0.15 ETH in order to proceed.
        if (txReceipt.value == 0.15) {
            console.log(txReceipt);
            next();
        } else {
            res.status(403).json({
                errorMessage: "User has not sent the correct amount. Please pay the correct value."
            })
        }
    } else {
        res.status(403).json({
            errorMessage: "Transaction not mined yet or has wrong hash. Please check again."
        });
    }
}

module.exports = { paymentReceived };