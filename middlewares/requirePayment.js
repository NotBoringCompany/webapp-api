const ethers = require("ethers");

const moralisAPINode = process.env.MORALIS_APINODE;
// address for receiving payment from user
const receiverWallet = process.env.RECEIVER_WALLET;
const mintingPrice = parseFloat(process.env.MINTING_PRICE);
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const paymentReceived = async (req, res, next) => {
	try {
		const { txHash, purchaserAddress } = req.body;

		let txReceipt = await customHttpProvider.getTransaction(txHash);
		if (txReceipt && txReceipt.blockNumber) {
			// ensures that the user has actually sent the correct amount (minting price) to proceed.
			if (
				parseFloat(ethers.utils.formatEther(txReceipt.value)) ===
					mintingPrice &&
				txReceipt.to === receiverWallet &&
				txReceipt.from.toLowerCase() === purchaserAddress.toLowerCase()
			) {
				next();
			} else {
				res.status(403).json({
					errorMessage:
						"User did not pay minting price or to or from address is wrong. Please check again.",
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
