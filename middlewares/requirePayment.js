const ethers = require("ethers");

// address for receiving payment from user
const receiverWallet = process.env.RECEIVER_WALLET;
const publicMintingPrice = parseFloat(process.env.MINTING_PRICE);
const whitelistedMintingPrice = parseFloat(
	process.env.WHITELISTED_MINTING_PRICE
);

const nodeURL = "https://rpc-mumbai.maticvigil.com";
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const paymentReceived = async (req, res, next) => {
	try {
		const { purchaseType, txHash, purchaserAddress, txGasFee } = req.body;

		const txReceipt = await customHttpProvider.getTransaction(txHash);
		const txValue = parseFloat(ethers.utils.formatEther(txReceipt.value));
		const floatGasFee = parseFloat(txGasFee);
		const totalFee = parseFloat(
			parseFloat(publicMintingPrice + floatGasFee).toFixed(5)
		);

		if (txReceipt && txReceipt.blockNumber) {
			if (purchaseType === "whitelisted") {
				if (
					txValue === totalFee &&
					txReceipt.to === receiverWallet &&
					txReceipt.from.toLowerCase() === purchaserAddress.toLowerCase()
				) {
					next();
				} else {
					res.status(403).json({
						errorMessage:
							"User did not pay whitelisted minting price or to or from address is wrong. Please check again.",
					});
				}
			} else if (purchaseType === "public") {
				if (
					txValue === totalFee &&
					txReceipt.to === receiverWallet &&
					txReceipt.from.toLowerCase() === purchaserAddress.toLowerCase()
				) {
					console.log("succesful, now minting");
					next();
				} else {
					res.status(403).json({
						errorMessage:
							"User did not pay public minting price or to or from address is wrong. Please check again.",
					});
				}
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
