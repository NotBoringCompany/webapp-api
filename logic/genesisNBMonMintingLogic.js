const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

const { addToActivities } = require("./activitiesLogic");
const { uploadGenesisEggMetadata } = require("./genesisMetadataLogic");

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

		//Turns response to string, and turn it back to JSON
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

		const mintedId = await genesisContract.currentGenesisNBMonCount() - 1;

		//add metadata of the egg to Spaces
		uploadGenesisEggMetadata(mintedId);

		return { nbmonId: mintedId };
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

		//Turns response to string, and turn it back to JSON
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

		const mintedId = await genesisContract.currentGenesisNBMonCount() - 1;

		//add metadata of the egg to Spaces
		uploadGenesisEggMetadata(mintedId);
		
		return { nbmonId: mintedId };
	} catch (err) {
		return err;
	}
};

module.exports = { whitelistedMint, publicMint };
