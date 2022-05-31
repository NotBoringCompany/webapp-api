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

		//pack all of the calculated data into the metadata arrays
		const stringMetadata = [gender, rarity, mutation, species, genus, typeOne, typeTwo, passiveOne, passiveTwo];
		// 300 = hatchingDuration (will change later on)
		// 0 (at the last index) = hatchedAt. will get changed when actually hatched
		const numericMetadata = [300, healthPotential, energyPotential, atkPotential, defPotential, spAtkPotential, spDefPotential, speedPotential, fertility, 0];

		//get bornAt to match sig
		const nbmon = await genesisContract.getNFT(nbmonId);
		const bornAt = parseInt(Number(nbmon["bornAt"]));
		let unsignedTx = await genesisContract.populateTransaction.addHatchingStats(
			nbmonId,
			signer.address,
			bornAt,
			txSalt,
			signature,


		)

		console.log(typeof rarity);
	} catch (err) {
		throw new Error(err.stack);
	}
}

// hatches the nbmon from an egg and gives it its respective stats
// const randomizeHatchingStats = async () => {
// 	try {

// 		let unsignedTx = await genesisContract.populateTransaction.addValidKey(
// 			key,
// 			nbmonStats,
// 			types,
// 			potential,
// 			passives
// 		);
// 		let response = await signer.sendTransaction(unsignedTx);
// 		let minedResponse = await response.wait();

// 		//Upon successful minting
// 		await saveHatchingKey(key);

// 		return {
// 			response: minedResponse,
// 			key: key,
// 		};
// 	} catch (err) {
// 		return err;
// 	}
// };

randomizeHatchingStats();

module.exports = {
	randomizeHatchingStats,
};
