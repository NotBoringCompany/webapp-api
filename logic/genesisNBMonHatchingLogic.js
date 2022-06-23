const { v4: uuidv4 } = require("uuid");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

const genesisStatRandomizer = require("../calculations/genesisStatRandomizer");
const { saveHatchingKey } = require("../logic/activitiesLogic");
const { getGenesisNBMonTypes } = require("./genesisNBMonLogic");

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

const randomizeHatchingStats = async (nbmonId, txSalt, signature) => {
	try {
		const signer = new ethers.Wallet(pvtKey, customHttpProvider);
		const gender = (await genesisStatRandomizer.randomizeGenesisGender());
		const rarity = (await genesisStatRandomizer.randomizeGenesisRarity());
		const genus = (await genesisStatRandomizer.randomizeGenesisGenus());
		const mutation = (await genesisStatRandomizer.randomizeGenesisMutation(genus));
		const species = "Origin";
		const fertility = 3000;

		const types = await getGenesisNBMonTypes(genus);
		const { typeOne, typeTwo } = (types[0], types[1]);
		const potential = await genesisStatRandomizer.randomizeGenesisPotential(rarity);
		const { 
			healthPotential, 
			energyPotential, 
			atkPotential, 
			defPotential, 
			spAtkPotential, 
			spDefPotential, 
			speedPotential 
		} = (potential[0], potential[1], potential[2], potential[3], potential[4], potential[5], potential[6]);
		const passives = await genesisStatRandomizer.randomizeGenesisPassives();
		const { passiveOne, passiveTwo } = (passives[0], passives[1]);

		const hatchedTimestamp = (await customHttpProvider.getBlock(blockNumber)).timestamp;

		//pack all of the calculated data into the metadata arrays
		const stringMetadata = [gender, rarity, mutation, species, genus, typeOne, typeTwo, passiveOne, passiveTwo];
		const numericMetadata = [0, healthPotential, energyPotential, atkPotential, defPotential, spAtkPotential, spDefPotential, speedPotential, fertility, hatchedTimestamp];
		const boolMetadata = [false];

		//get bornAt to match sig
		const nbmon = await genesisContract.getNFT(nbmonId);
		const bornAt = parseInt(Number(nbmon["bornAt"]));
		let unsignedTx = await genesisContract.populateTransaction.addHatchingStats(
			nbmonId,
			signer.address,
			bornAt,
			txSalt,
			signature,
			stringMetadata,
			numericMetadata,
			boolMetadata
		);
		let response = await signer.sendTransaction(unsignedTx);
		let minedResponse = await response.wait();

		return {
			response: minedResponse,
			signature: signature
		}
	} catch (err) {
		throw new Error(err.stack);
	}
}

randomizeHatchingStats();

module.exports = {
	randomizeHatchingStats,
};
