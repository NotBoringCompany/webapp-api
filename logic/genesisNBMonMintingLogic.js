const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const Moralis = require("moralis/node");

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

const whitelistedMint = async (address) => {
	try {
		const signer = new ethers.Wallet(pvtKey, customHttpProvider);
		let owner = address;
		let amountToMint = 1;
		let hatchingDuration = 300;
		let nbmonStats = [];
		let types = [];
		let potential = [];
		let passives = [];
		let isEgg = true;

		let unsignedTx =
			await genesisContract.populateTransaction.whitelistedGenesisEggMint(
				owner,
				amountToMint,
				hatchingDuration,
				nbmonStats,
				types,
				potential,
				passives,
				isEgg
			);
		let response = await signer.sendTransaction(unsignedTx);
		await response.wait();

		//Turn response to string, and turn it back to JSON
		//This is done because for some reason response is a ParseObject and not a JSON
		const jsonResponse = JSON.parse(JSON.stringify(response));
		//Read about ParseObject: https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Object.html
		//Parseplatform is used by Moralis' DB

		//Upon successful minting
		await addToActivities(
			jsonResponse.hash,
			"genesisMinting",
			"eth",
			process.env.MINTING_PRICE
		);
		return response;
	} catch (err) {
		return err;
	}
};

const publicMint = async (address) => {
	try {
		const signer = new ethers.Wallet(pvtKey, customHttpProvider);
		let owner = address;
		let amountToMint = 1;
		let hatchingDuration = 300;
		let nbmonStats = [];
		let types = [];
		let potential = [];
		let passives = [];
		let isEgg = true;

		let unsignedTx =
			await genesisContract.populateTransaction.publicGenesisEggMint(
				owner,
				amountToMint,
				hatchingDuration,
				nbmonStats,
				types,
				potential,
				passives,
				isEgg
			);
		let response = await signer.sendTransaction(unsignedTx);
		await response.wait();
		const jsonResponse = JSON.parse(JSON.stringify(response));

		//Upon successful minting
		await addToActivities(
			jsonResponse.hash,
			"genesisMinting",
			"eth",
			process.env.MINTING_PRICE
		);
		return response;
	} catch (err) {
		return err;
	}
};

const addToActivities = async (
	transactionHash,
	transactionType,
	network,
	value
) => {
	try {
		console.log("querying EthNFTTransfers...");
		const ethNFTTransfers = Moralis.Object.extend("EthNFTTransfers");
		const ethNFTQuery = new Moralis.Query(ethNFTTransfers);

		ethNFTQuery.equalTo("transaction_hash", transactionHash);
		const queryResult = await ethNFTQuery.first({ useMasterKey: true });

		const jsonResult = JSON.parse(JSON.stringify(queryResult));
		const { from_address, to_address, createdAt } = jsonResult;

		console.log("result:");
		console.log(jsonResult);
		console.log("***********************");

		//add to our custom created Class "NFTTransfers", so can be displayed as activities in the frontend
		const NFTTransfer = Moralis.Object.extend("NFTTransfers");
		const newTransfer = new NFTTransfer();

		newTransfer.set("address_from", from_address);
		newTransfer.set("address_to", to_address);
		newTransfer.set("transaction_hash", transactionHash);
		newTransfer.set("transaction_type", transactionType);
		newTransfer.set("network", network);
		newTransfer.set("value", value.toString());
		newTransfer.set("timestamp", createdAt);

		//Saving user master key (due to CLP being only "read" for only public)
		await newTransfer.save(null, { useMasterKey: true });

		console.log("saved to NFTTransfers - can be used as activities!");
	} catch (err) {
		return err;
	}
};

module.exports = { whitelistedMint, publicMint, addToActivities };
