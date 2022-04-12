const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

const moralisAPINode = process.env.MORALIS_APINODE;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);
const moment = require("moment");

const genesisNBMonABI = fs.readFileSync(
	path.resolve(__dirname, "../abi/genesisNBMon.json")
);
const genesisABI = JSON.parse(genesisNBMonABI);
const genesisContract = new ethers.Contract(
	process.env.CONTRACT_ADDRESS,
	genesisABI,
	customHttpProvider
);

const getGenesisNBMon = async (id) => {
	try {
		let nbmonObj = {};
		const nbmon = await genesisContract.getGenesisNBMon(id);

		nbmonObj["nbmonId"] = parseInt(Number(nbmon[0]));
		nbmonObj["owner"] = nbmon[1];
		/**
		 * @dev Checks if isEgg is true or false (nbmon[9]).
		 */
		if (nbmon[9] === true) {
			nbmonObj["bornAt"] = parseInt(Number(nbmon[2]));
		} else {
			nbmonObj["hatchedAt"] = parseInt(Number(nbmon[2]));
		}
		nbmonObj["transferredAt"] = parseInt(Number(nbmon[3]));

		nbmonObj["hatchingDuration"] = nbmon[4];
		/**
		 * @dev Will most likely only show when hatched, hence the extra check for null values.
		 */

		console.log(nbmon[5][0]);
		nbmonObj["gender"] = nbmon[5][0] === undefined ? null : nbmon[5][0];
		nbmonObj["rarity"] = nbmon[5][1] === undefined ? null : nbmon[5][1];
		nbmonObj["mutation"] = nbmon[5][2] === undefined ? null : nbmon[5][2];
		nbmonObj["species"] = nbmon[5][3] === undefined ? null : nbmon[5][3];
		nbmonObj["genera"] = nbmon[5][4] === undefined ? null : nbmon[5][4];
		nbmonObj["fertility"] = nbmon[5][5] === undefined ? null : nbmon[5][5];
		nbmonObj["firstType"] = nbmon[6][0] === undefined ? null : nbmon[6][0];
		nbmonObj["secondType"] = nbmon[6][1] === undefined ? null : nbmon[6][1];
		nbmonObj["healthPotential"] =
			nbmon[7][0] === undefined ? null : nbmon[7][0];
		nbmonObj["energyPotential"] =
			nbmon[7][1] === undefined ? null : nbmon[7][1];
		nbmonObj["attackPotential"] =
			nbmon[7][2] === undefined ? null : nbmon[7][2];
		nbmonObj["defensePotential"] =
			nbmon[7][3] === undefined ? null : nbmon[7][3];
		nbmonObj["spAtkPotential"] = nbmon[7][4] === undefined ? null : nbmon[7][4];
		nbmonObj["spDefPotential"] = nbmon[7][5] === undefined ? null : nbmon[7][5];
		nbmonObj["speedPotential"] = nbmon[7][6] === undefined ? null : nbmon[7][6];
		nbmonObj["firstPassive"] = nbmon[8][0] === undefined ? null : nbmon[8][0];
		nbmonObj["secondPassive"] = nbmon[8][1] === undefined ? null : nbmon[8][1];
		nbmonObj["isEgg"] = nbmon[9];

		return nbmonObj;
	} catch (err) {
		return err;
	}
};

const getOwnerGenesisNBMonIDs = async (address) => {
	try {
		const ids = await genesisContract.getOwnerGenesisNBMonIds(address);
		let convertedArray = [];
		for (let i = 0; i < ids.length; i++) {
			let converted = parseInt(Number(ids[i]));
			convertedArray.push(converted);
		}
		return convertedArray;
	} catch (err) {
		return err;
	}
};

/**
 * @dev This API call will take a longer time the more NBMons the owner has.
 */
const getOwnerGenesisNBMons = async (address) => {
	try {
		const ownedIDs = await getOwnerGenesisNBMonIDs(address);
		let nbmons = [];

		for (let i = 0; i < ownedIDs.length; i++) {
			let nbmon = await getGenesisNBMon(ownedIDs[i]);
			nbmons.push(nbmon);
		}

		return nbmons;
	} catch (err) {
		return err;
	}
};

const generalConfig = async () => {
	try {
		const supplyLimit = 5000; // total number of NBMOns that can be minted
		const haveBeenMinted = parseInt(
			Number(await genesisContract.totalSupply())
		); // total number of NBMons that have been minted

		const now = moment().unix();
		const publicOpenAt = process.env.PUBLIC_MINT_TIME_UNIX;
		const whitelistOpenAt = process.env.WHITELIST_MINT_TIME_UNIX;

		const isWhitelistOpen = now >= whitelistOpenAt;
		const isPublicOpen = now >= publicOpenAt;

		const supplies = { haveBeenMinted, supplyLimit };
		const timeStamps = {
			now,
			publicOpenAt,
			whitelistOpenAt,
			isWhitelistOpen,
			isPublicOpen,
		};

		return { timeStamps, supplies };
	} catch (e) {
		return e;
	}
};

const config = async (address) => {
	try {
		const generalConfigs = await generalConfig();
		const { isWhitelistOpen, isPublicOpen } = generalConfigs;
		const isWhitelisted = await genesisContract.whitelisted(address);

		const hasMintedBefore = (await genesisContract.amountMinted(address))
			? true
			: false;
		let canMint = false;

		if (isWhitelisted) {
			if (isWhitelistOpen && !hasMintedBefore) canMint = true;
			else canMint = false;
		} else {
			if (isPublicOpen && !hasMintedBefore) canMint = true;
			else canMint = false;
		}

		const status = { address, canMint, isWhitelisted };

		return { status, ...generalConfigs };
	} catch (e) {
		return e;
	}
};

const getSupplies = async () => {
	try {
		const supplyLimit = 5000; // total number of NBMOns that can be minted
		const haveBeenMinted = parseInt(
			Number(await genesisContract.totalSupply())
		); // total number of NBMons that have been minted

		// const remainingSupply = supplyLimit - parseInt(Number(totalSupply));

		return {
			haveBeenMinted,
			supplyLimit,
		};
	} catch (err) {
		return err;
	}
};

module.exports = {
	getGenesisNBMon,
	getOwnerGenesisNBMonIDs,
	getOwnerGenesisNBMons,
	getSupplies,
	config,
	generalConfig,
};
