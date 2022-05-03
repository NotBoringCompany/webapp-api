const Moralis = require("moralis/node");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const moralisAPINode = process.env.MORALIS_APINODE;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const { getAttackEffectiveness, getDefenseEffectiveness } = require("../logic/typeEffectivenessLogic");
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

		// calculate if nbmon is hatchable or not
		let now = moment().unix();
		let hatchableTime = parseInt(Number(nbmon[2])) + parseInt(Number(nbmon[4]));

		nbmonObj["nbmonId"] = parseInt(Number(nbmon[0]));
		nbmonObj["owner"] = nbmon[1];
		/**
		 * @dev Checks if isEgg is true or false (nbmon[9]).
		 */
		if (nbmon[9] === true) {
			nbmonObj["bornAt"] = parseInt(Number(nbmon[2]));
			nbmonObj["isHatchable"] = now >= hatchableTime;
		} else {
			nbmonObj["hatchedAt"] = parseInt(Number(nbmon[2]));
			nbmonObj["isHatchable"] = false;
		}
		nbmonObj["transferredAt"] = parseInt(Number(nbmon[3]));

		nbmonObj["hatchingDuration"] = nbmon[4];
		/**
		 * @dev Will most likely only show when hatched, hence the extra check for null values.
		 */
		const firstType = nbmon[6][0] === undefined ? null : nbmon[6][0];
		const secondType = nbmon[6][1] === undefined ? null : nbmon[6][1];
		// calculates typeEffectiveness
		const attackEff = await getAttackEffectiveness(firstType, secondType, "true");
		const defenseEff = await getDefenseEffectiveness(firstType, secondType, "true");
		nbmonObj["strongAgainst"] = attackEff["Strong against"];
		nbmonObj["weakAgainst"] = attackEff["Weak against"];
		nbmonObj["resistantTo"] = defenseEff["Resistant to"];
		nbmonObj["vulnerableTo"] = defenseEff["Vulnerable to"];

		firstPassive = nbmon[8][0] === undefined ? null : nbmon[8][0];
		secondPassive = nbmon[8][1] === undefined ? null : nbmon[8][1];
		types = [firstType, secondType];
		passives = [firstPassive, secondPassive];
		nbmonObj["gender"] = nbmon[5][0] === undefined ? null : nbmon[5][0];
		nbmonObj["rarity"] = nbmon[5][1] === undefined ? null : nbmon[5][1];

		// calculation for mutation
		// if still an egg
		if (nbmon[9] === true) {
			nbmonObj["mutation"] = "Not mutated";
			nbmonObj["mutationType"] = null;
		// if already hatched
		} else {
			nbmonObj["mutation"] = nbmon[5][2] === "Not mutated" ? nbmon[5][2] : "Mutated";
			nbmonObj["mutationType"] = nbmonObj["mutation"] === "Mutated" ? nbmon[5][2] : null;
		}

		nbmonObj["species"] = nbmon[5][3] === undefined ? null : nbmon[5][3];
		nbmonObj["genus"] = nbmon[5][4] === undefined ? null : nbmon[5][4];
		nbmonObj["genusDescription"] = await getGenesisGenusDescription(nbmonObj["genus"]);
		nbmonObj["behavior"] = await getGenesisBehavior(nbmonObj["genus"]);

		// calculation for fertility
		nbmonObj["fertility"] = nbmon[5][5] === undefined ? null : nbmon[5][5];
		if (nbmon[5][1] !== undefined) {
			nbmonObj["fertilityDeduction"] = await getGenesisFertilityDeduction(nbmon[5][1]);
		} else {
			nbmonObj["fertilityDeduction"] = null;
		}

		nbmonObj["types"] = types;
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
		nbmonObj["passives"] = passives;
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

const getGenesisNBMonTypes = async (genusParam) => {
	try {
		const typesQuery = new Moralis.Query("NBMon_Data");

		const typesPipeline = [
			{ match: { Genus: genusParam } },
			{ project: { _id: 0, Types: 1 } }
		];

		const typesAggRes = await typesQuery.aggregate(typesPipeline);

		return typesAggRes[0]["Types"];

	} catch (err) {
		return err;
	}
};

const getGenesisGenusDescription = async (genusParam) => {
	try {
		if (genusParam !==  null) {
			const descQuery = new Moralis.Query("NBMon_Data");

			const descPipeline = [
				{ match: { Genus: genusParam } },
				{ project: { _id: 0, Description: 1 } }
			];

			const descAggRes = await descQuery.aggregate(descPipeline);
			return descAggRes[0]["Description"];
		} else {
			return null;
		}
	} catch (err) {
		return err;
	}
}

const getGenesisBehavior = async (genusParam) => {
	try {
		if (genusParam !== null) {
			const behaviorQuery = new Moralis.Query("NBMon_Data");

			const behaviorPipeline = [
				{ match: { Genus: genusParam } },
				{ project: { _id: 0, Behavior: 1 } }
			];

			const behaviorAggRes = await behaviorQuery.aggregate(behaviorPipeline);
			return behaviorAggRes[0]["Behavior"];
		} else {
			return null;
		}
	} catch (err) {
		return err;
	}
}

const getGenesisFertilityDeduction = async (rarity) => {
	try {
		switch (rarity) {
			case "Common":
				return 1000;
			case "Uncommon":
				return 750;
			case "Rare":
				return 600;
			case "Epic":
				return 500;
			case "Legendary":
				return 375;
			case "Mythical":
				return 300;
		}
	} catch (err) {
		return err;
	}
};

const generalConfig = async () => {
	try {
		const supplyLimit = 5000; // total number of NBMons that can be minted
		const haveBeenMinted = parseInt(Number(await genesisContract.totalSupply())); // total number of NBMons that have been minted
		const now = moment().unix();
		const publicOpenAt = parseInt(process.env.PUBLIC_MINT_TIME_UNIX);
		const whitelistOpenAt = parseInt(process.env.WHITELIST_MINT_TIME_UNIX);
		const mintingCloseAt = parseInt(process.env.CLOSE_MINT_TIME_UNIX);

		const isWhitelistOpen = now >= whitelistOpenAt && now < mintingCloseAt;
		const isPublicOpen = now >= publicOpenAt && now < mintingCloseAt;
		const isMintingEnded = now > mintingCloseAt;

		const supplies = { haveBeenMinted, supplyLimit };
		const timeStamps = {
			now,
			publicOpenAt,
			whitelistOpenAt,
			mintingCloseAt,
			isWhitelistOpen,
			isPublicOpen,
			isMintingEnded,
		};

		return { timeStamps, supplies };
	} catch (err) {
		return err;
	}
};

const config = async (address) => {
	try {
		const generalConfigs = await generalConfig();
		const { isWhitelistOpen, isPublicOpen } = generalConfigs.timeStamps;
		const { haveBeenMinted, supplyLimit } = generalConfigs.supplies;
		const isWhitelisted = await genesisContract.whitelisted(address);

		const amountMinted = await genesisContract.amountMinted(address);

		const hasMintedFive = amountMinted === 5 ? true : false;
		let canMint = false;

		if (haveBeenMinted < supplyLimit) {
			if (isWhitelisted) {
				if (isWhitelistOpen && !hasMintedFive) canMint = true;
				else canMint = false;
			} else {
				if (isPublicOpen && !hasMintedFive) canMint = true;
				else canMint = false;
			}
		}

		const status = { address, canMint, isWhitelisted, amountMinted, hasMintedFive };

		return { status, ...generalConfigs };
	} catch (err) {
		return err;
	}
};

module.exports = {
	getGenesisNBMon,
	getOwnerGenesisNBMonIDs,
	getOwnerGenesisNBMons,
	config,
	generalConfig,
	getGenesisNBMonTypes,
	getGenesisFertilityDeduction,
	getGenesisGenusDescription,
	getGenesisBehavior
};
