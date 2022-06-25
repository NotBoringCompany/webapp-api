const ethers = require("ethers");

const moralisAPINode = process.env.MORALIS_APINODE;
// address for receiving payment from user
const receiverWallet = process.env.RECEIVER_WALLET;
const publicMintingPrice = parseFloat(process.env.MINTING_PRICE);
const whitelistedMintingPrice = parseFloat(
	process.env.WHITELISTED_MINTING_PRICE
);
const genesisHatchingPrice = parseFloat(process.env.GENESIS_HATCHING_PRICE);
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const paymentReceived = async (req, res, next) => {
	try {
		const { purchaseType, txHash, purchaserAddress, txGasFee } = req.body;

		const txReceipt = await customHttpProvider.getTransaction(txHash);
		const txValue = parseFloat(ethers.utils.formatEther(txReceipt.value));
		const floatGasFee = parseFloat(txGasFee);

		if (txReceipt && txReceipt.blockNumber) {
			if (purchaseType === "whitelisted") {
				const totalFee = parseFloat(
					parseFloat(whitelistedMintingPrice + floatGasFee).toFixed(5)
				);

				if (
					txValue === totalFee &&
					txReceipt.to === receiverWallet &&
					txReceipt.from.toLowerCase() === purchaserAddress.toLowerCase()
				) {
					console.log("payment middleware successful, now minting (whitelist)");
					next();
				} else {
					res.status(403).json({
						errorMessage:
							"User did not pay whitelisted minting price or to or from address is wrong. Please check again.",
					});
				}
			} else if (purchaseType === "public") {
				const totalFee = parseFloat(
					parseFloat(publicMintingPrice + floatGasFee).toFixed(5)
				);

				if (
					txValue === totalFee &&
					txReceipt.to === receiverWallet &&
					txReceipt.from.toLowerCase() === purchaserAddress.toLowerCase()
				) {
					console.log("payment middleware successful, now minting (public)");
					next();
				} else {
					res.status(403).json({
						errorMessage:
							"User did not pay public minting price or to or from address is wrong. Please check again.",
					});
				}
			} else if (purchaseType === "genesisHatching") {
				const totalFee = parseFloat(genesisHatchingPrice + floatGasFee);

				console.log(totalFee, floatGasFee);
				console.log(txValue);

				if (
					txValue === totalFee &&
					txReceipt.to === receiverWallet &&
					txReceipt.from.toLowerCase() === purchaserAddress.toLowerCase()
				) {
					console.log(
						"payment middleware successful, trying to generate hatching signature"
					);
					next();
				} else {
					res.status(403).json({
						errorMessage:
							"User did not pay hatching price or to or from address is wrong. Please check again.",
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
