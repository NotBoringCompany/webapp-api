const Moralis = require("moralis/node");
const moment = require("moment");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

// const { addToActivities } = require("./activitiesLogic");
const { uploadGenesisEggMetadata } = require("./genesisMetadataLogic");

const pvtKey = process.env.PRIVATE_KEY_1;

const nodeURL = process.env.RPC_URL;

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
		// signed by minter
		const signer = new ethers.Wallet(pvtKey, customHttpProvider);
		let owner = address;
		let amountToMint = 1;
		let stringMetadata = ["", "", "", "", "", "", "", "", ""];
		// hatching duration for now is 300, will be longer later.
		let numericMetadata = [300, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let boolMetadata = [true];

		let unsignedTx = await genesisContract.populateTransaction.whitelistedMint(
			owner,
			amountToMint,
			stringMetadata,
			numericMetadata,
			boolMetadata
		);
		let response = await signer.sendTransaction(unsignedTx);
		await response.wait();

		console.log("Minting whitelist...");

		//Turns response to string, and turn it back to JSON
		//This is done because for some reason response is a ParseObject and not a JSON
		// const jsonResponse = JSON.parse(JSON.stringify(response));

		// //Upon successful minting
		// await addToActivities(
		// 	jsonResponse.hash,
		// 	"genesisMinting",
		// 	"matic",
		// 	process.env.MINTING_PRICE
		// );

		const currentCount = await genesisContract._currentIndex();
		// just to be extra safe
		const mintedId = parseInt(currentCount) - 1;
		if (!mintedId || mintedId === undefined || isNaN(mintedId)) {
			throw new Error("minted ID is undefined");
		}

		// add to "Genesis_NBMons" database
		const GenesisNBMons = Moralis.Object.extend("Genesis_NBMons");
		const genesisNBMons = new GenesisNBMons();

		genesisNBMons.set("Token_ID", mintedId);
		genesisNBMons.set("Owner", owner);
		genesisNBMons.set("String_Metadata", stringMetadata);
		genesisNBMons.set("Numeric_Metadata", numericMetadata);
		genesisNBMons.set("Bool_Metadata", boolMetadata);
		genesisNBMons.set("Born_At", parseInt(moment().unix()));
		genesisNBMons.set("Transferred_At", parseInt(moment().unix()));

		await genesisNBMons.save(null, { useMasterKey: true }).then((obj) => {
			// gets the object ID for the nbmon and then sets it to the game data class's nbmon instance
			gameData.set("NBMon_Instance", {
				__type: "Pointer",
				className: "Genesis_NBMons",
				objectId: obj.id
			});
		});

		await gameData.save(null, { useMasterKey: true });

		//add metadata of the egg to Spaces
		uploadGenesisEggMetadata(mintedId, numericMetadata[0]);

		return { nbmonId: mintedId };
	} catch (err) {
		throw err;
	}
};

const publicMint = async (address) => {
	try {
		const signer = new ethers.Wallet(pvtKey, customHttpProvider);
		let owner = address;
		let amountToMint = 1;
		let stringMetadata = ["", "", "", "", "", "", "", "", ""];
		// hatching duration for now is 300, will be longer later.
		let numericMetadata = [300, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let boolMetadata = [true];

		let unsignedTx = await genesisContract.populateTransaction.publicMint(
			owner,
			amountToMint,
			stringMetadata,
			numericMetadata,
			boolMetadata
		);

		let response = await signer.sendTransaction(unsignedTx);
		await response.wait();

		//Turns response to string, and turn it back to JSON
		//This is done because for some reason response is a ParseObject and not a JSON
		// const jsonResponse = JSON.parse(JSON.stringify(response));

		//Read about ParseObject: https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Object.html
		//Parseplatform is used by Moralis' DB
		//Upon successful minting

		// await addToActivities(
		// 	jsonResponse.hash,
		// 	"genesisMinting",
		// 	"matic",
		// 	process.env.MINTING_PRICE
		// ).catch((err) => {
		// 	throw err;
		// });

		const currentCount = await genesisContract._currentIndex();

		// just to be extra safe
		const mintedId = parseInt(currentCount) - 1;

		if (!mintedId || mintedId === undefined || isNaN(mintedId)) {
			throw new Error("minted ID is undefined");
		}

		// add to "Genesis_NBMons" database
		const GenesisNBMons = Moralis.Object.extend("Genesis_NBMons");
		const genesisNBMons = new GenesisNBMons();

		genesisNBMons.set("NBMon_ID", mintedId);
		genesisNBMons.set("Owner", owner);
		genesisNBMons.set("String_Metadata", stringMetadata);
		genesisNBMons.set("Numeric_Metadata", numericMetadata);
		genesisNBMons.set("Bool_Metadata", boolMetadata);
		genesisNBMons.set("Born_At", parseInt(moment().unix()));
		genesisNBMons.set("Transferred_At", parseInt(moment().unix()));

		const GameData = Moralis.Object.extend("Genesis_NBMons_GameData");
		const gameData = new GameData();

		await genesisNBMons.save(null, { useMasterKey: true }).then((obj) => {
			// gets the object ID for the nbmon and then sets it to the game data class's nbmon instance
			gameData.set("NBMon_Instance", {
				__type: "Pointer",
				className: "Genesis_NBMons",
				objectId: obj.id
			});
		});

		await gameData.save(null, { useMasterKey: true });

		//add metadata of the egg to Spaces
		uploadGenesisEggMetadata(mintedId, numericMetadata[0]);

		return { nbmonId: mintedId };
	} catch (err) {
		throw err;
	}
};

module.exports = {
	whitelistedMint,
	publicMint,
};
