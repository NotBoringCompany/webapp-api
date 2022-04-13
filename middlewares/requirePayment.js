require("dotenv").config();
const ethers = require("ethers");

const moralisAPINode = process.env.MORALIS_APINODE;
const ethTransactionWalletAddress = process.env.ETH_TRANSACTION_WALLET_ADDRESS;
const mintingPrice = parseFloat(process.env.MINTING_PRICE);
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const paymentReceived = async (req, res, next) => {
	try {
		const { txHash, customerWalletAddress } = req.body;

		let txReceipt = await customHttpProvider.getTransaction(txHash);
		const ethValueDecimal = parseFloat(
			parseInt(Number(txReceipt.value)) / Math.pow(10, 18) // converts wei to eth
		);
		if (txReceipt && txReceipt.blockNumber) {
			// ensures that the user has actually sent the correct amount (minting price) to proceed.
			if (
				ethValueDecimal === mintingPrice &&
				txReceipt.to === ethTransactionWalletAddress &&
				txReceipt.from.toLowerCase() === customerWalletAddress
				// for some reason customer's wallet address
				//sent from client (Moralis, FE) is only in lowercase
			) {
				next();
			} else {
				res.status(403).json({
					errorMessage: "Transaction is invalid for minting",
				});
			}
		} else {
			// will not reach here anyway since if the transaction hash is invalid, it will directly catch an error.
			// this code is only for safety measures.
			res.status(403).json({
				errorMessage:
					"Transaction hash provided is either invalid or not minted yet. Please check again later.",
			});
		}
	} catch (err) {
		res.status(403).json({
			errorMessageFromBackend: err.message,
			errorMessage:
				"Transaction hash provided is either invalid or not minted yet. Please check again later.",
		});
	}
};

module.exports = { paymentReceived };
