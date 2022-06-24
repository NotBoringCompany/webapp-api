const Moralis = require("moralis/node");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const moralisAPINode = process.env.MORALIS_APINODE;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const {
	getAttackEffectiveness,
	getDefenseEffectiveness,
} = require("../logic/typeEffectivenessLogic");
const genesisNBMonABI = fs.readFileSync(
	path.resolve(__dirname, "../abi/genesisNBMon.json")
);
const genesisABI = JSON.parse(genesisNBMonABI);
const genesisContract = new ethers.Contract(
	process.env.CONTRACT_ADDRESS,
	genesisABI,
	customHttpProvider
);

/**
 * @dev Genesis NBMon returns a struct which contains relevant info and metadata in the form of type-based arrays.
 * stringMetadata[] = gender, rarity, mutation, species, genus, first type, second type, first passive and second passive (9 indexes)
 * numericMetadata[] = hatchingDuration, health potential, energy potential, attack potential, defense potential, spAtk potential, spDef potential, speed potential, fertility points and hatchedAt (10 indexes)
 * boolMetadata[] = isEgg (1 index)
 */
const getGenesisNBMon = async (id) => {
	try {
		let nbmonObj = {};
		// returns the nbmon in the form of an NFT struct.
		// for reference, please check `https://github.com/NotBoringCompany/smart-contracts/blob/main/contracts/BEP721A/NFTCoreA.sol`
		const nbmon = await genesisContract.getNFT(id);

		/// calculates if nbmon is hatchable
		let now = moment().unix();
		// gets hatchingDuration + bornAt timestamp = time when nbmon is hatchable
		let hatchableTime =
			parseInt(Number(nbmon["numericMetadata"][0])) +
			parseInt(Number(nbmon["bornAt"]));

		nbmonObj["nbmonId"] = parseInt(Number(nbmon["tokenId"]));
		nbmonObj["owner"] = nbmon["owner"];
		nbmonObj["bornAt"] = parseInt(Number(nbmon["bornAt"]));

		/// check if isEgg is true or false to return respective hatching metadata
		if (nbmon["boolMetadata"][0] === true) {
			nbmonObj["hatchedAt"] = null;
			nbmonObj["isHatchable"] = now >= hatchableTime;
		} else {
			nbmonObj["hatchedAt"] = parseInt(Number(nbmon["numericMetadata"][9]));
			nbmonObj["isHatchable"] = false;
		}

		nbmonObj["transferredAt"] = parseInt(Number(nbmon["transferredAt"]));
		nbmonObj["hatchingDuration"] = parseInt(
			Number(nbmon["numericMetadata"][0])
		);

		/// will most likely only show when hatched, hence the extra check for undefined values
		const firstType =
			nbmon["stringMetadata"][5] === undefined
				? null
				: nbmon["stringMetadata"][5];
		const secondType =
			nbmon["stringMetadata"][6] === undefined
				? null
				: nbmon["stringMetadata"][6];
		let types = [firstType, secondType];

		nbmonObj["types"] = types;

		// calculates type effectiveness
		const attackEff = await getAttackEffectiveness(firstType, secondType);
		const defenseEff = await getDefenseEffectiveness(firstType, secondType);

		nbmonObj["strongAgainst"] = attackEff["Strong against"];
		nbmonObj["weakAgainst"] = attackEff["Weak against"];
		nbmonObj["resistantTo"] = defenseEff["Resistant to"];
		nbmonObj["vulnerableTo"] = defenseEff["Vulnerable to"];

		// gets passives. same like types - checks for undefined values.
		firstPassive =
			nbmon["stringMetadata"][7] === undefined
				? null
				: nbmon["stringMetadata"][7];
		secondPassive =
			nbmon["stringMetadata"][8] === undefined
				? null
				: nbmon["stringMetadata"][8];
		let passives = [firstPassive, secondPassive];

		nbmonObj["passives"] = passives;
		nbmonObj["gender"] =
			nbmon["stringMetadata"][0] === undefined
				? null
				: nbmon["stringMetadata"][0];
		nbmonObj["rarity"] =
			nbmon["stringMetadata"][1] === undefined
				? null
				: nbmon["stringMetadata"][1];

		// mutation calculation
		// if nbmon is still an egg
		if (nbmon["boolMetadata"][0] === true) {
			nbmonObj["mutation"] = "Not mutated";
			nbmonObj["mutationType"] = null;
			nbmonObj["behavior"] = null;
			// if already hatched
		} else {
			nbmonObj["mutation"] =
				nbmon["stringMetadata"][2] === "Not mutated"
					? nbmon["stringMetadata"][2]
					: "Mutated";
			nbmonObj["mutationType"] =
				nbmonObj["mutation"] === "Mutated" ? nbmon["stringMetadata"][2] : null;
			nbmonObj["behavior"] = await getGenesisBehavior(nbmonObj["genus"]);
		}

		nbmonObj["species"] =
			nbmon["stringMetadata"][3] === undefined
				? null
				: nbmon["stringMetadata"][3];
		nbmonObj["genus"] =
			nbmon["stringMetadata"][4] === undefined
				? null
				: nbmon["stringMetadata"][4];
		nbmonObj["genusDescription"] = await getGenesisGenusDescription(
			nbmonObj["genus"]
		);

		// fertility calculation
		nbmonObj["fertility"] =
			parseInt(Number(nbmon["numericMetadata"][8])) === undefined
				? null
				: parseInt(Number(nbmon["numericMetadata"][8]));
		if (nbmon["stringMetadata"][1] !== undefined) {
			nbmonObj["fertilityDeduction"] = await getGenesisFertilityDeduction(
				nbmon["stringMetadata"][1]
			);
		} else {
			nbmonObj["fertilityDeduction"] = null;
		}
		nbmonObj["healthPotential"] =
			parseInt(Number(nbmon["numericMetadata"][1])) === undefined
				? null
				: parseInt(Number(nbmon["numericMetadata"][1]));
		nbmonObj["energyPotential"] =
			parseInt(Number(nbmon["numericMetadata"][2])) === undefined
				? null
				: parseInt(Number(nbmon["numericMetadata"][2]));
		nbmonObj["attackPotential"] =
			parseInt(Number(nbmon["numericMetadata"][3])) === undefined
				? null
				: parseInt(Number(nbmon["numericMetadata"][3]));
		nbmonObj["defensePotential"] =
			parseInt(Number(nbmon["numericMetadata"][4])) === undefined
				? null
				: parseInt(Number(nbmon["numericMetadata"][4]));
		nbmonObj["spAtkPotential"] =
			parseInt(Number(nbmon["numericMetadata"][5])) === undefined
				? null
				: parseInt(Number(nbmon["numericMetadata"][5]));
		nbmonObj["spDefPotential"] =
			parseInt(Number(nbmon["numericMetadata"][6])) === undefined
				? null
				: parseInt(Number(nbmon["numericMetadata"][6]));
		nbmonObj["speedPotential"] =
			parseInt(Number(nbmon["numericMetadata"][7])) === undefined
				? null
				: parseInt(Number(nbmon["numericMetadata"][7]));
		nbmonObj["isEgg"] = nbmon["boolMetadata"][0];

		return nbmonObj;
	} catch (err) {
		throw new Error(err.stack);
	}
};

const getOwnerGenesisNBMonIDs = async (address) => {
	try {
		const ids = await genesisContract.getOwnerNFTIds(address);
		let convertedArray = [];
		for (let i = 0; i < ids.length; i++) {
			let converted = parseInt(Number(ids[i]));
			convertedArray.push(converted);
		}
		return convertedArray;
	} catch (err) {
		throw new Error(err.stack);
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
		throw new Error(err.stack);
	}
};

const getGenesisNBMonTypes = async (genusParam) => {
	try {
		const typesQuery = new Moralis.Query("NBMon_Data");

		const typesPipeline = [
			{ match: { Genus: genusParam } },
			{ project: { _id: 0, Types: 1 } },
		];

		const typesAggRes = await typesQuery.aggregate(typesPipeline);
		return typesAggRes[0]["Types"];
		// console.log(typesAggRes[0]["Types"][0]);
	} catch (err) {
		throw new Error(err.stack);
	}
};

const getGenesisGenusDescription = async (genusParam) => {
	try {
		if (genusParam !== null) {
			const descQuery = new Moralis.Query("NBMon_Data");

			const descPipeline = [
				{ match: { Genus: genusParam } },
				{ project: { _id: 0, Description: 1 } },
			];

			const descAggRes = await descQuery.aggregate(descPipeline);
			return descAggRes[0]["Description"];
		} else {
			return null;
		}
	} catch (err) {
		return err;
	}
};

const getGenesisBehavior = async (genusParam) => {
	try {
		if (genusParam !== null) {
			const behaviorQuery = new Moralis.Query("NBMon_Data");

			const behaviorPipeline = [
				{ match: { Genus: genusParam } },
				{ project: { _id: 0, Behavior: 1 } },
			];

			const behaviorAggRes = await behaviorQuery.aggregate(behaviorPipeline);
			return behaviorAggRes[0]["Behavior"];
		} else {
			return null;
		}
	} catch (err) {
		throw new Error(err.stack);
	}
};

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
		throw new Error(err.stack);
	}
};

const generalConfig = async () => {
	try {
		const supplyLimit = await genesisContract.maxSupply(); // total number of NBMons that can be minted
		const haveBeenMinted = parseInt(
			Number(await genesisContract.totalSupply())
		); // total number of NBMons that have been minted
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
		const isBlackListed = await genesisContract.checkBlacklisted(address);
		const amountMinted = await genesisContract.checkAmountMinted(address);
		const hasMintedFive = amountMinted === 5 ? true : false;

		if (isBlackListed) {
			const status = {
				address,
				canMint: false,
				isWhitelisted: false,
				amountMinted,
				hasMintedFive,
			};

			return { status, ...generalConfigs };
		}

		const { haveBeenMinted, supplyLimit } = generalConfigs.supplies;
		const { isWhitelistOpen, isPublicOpen, isMintingEnded } =
			generalConfigs.timeStamps;

		const isWhitelisted = await genesisContract.checkWhitelisted(address);
		const isProfileRegistered = await genesisContract.profileRegistered(
			address
		);
		let canMint = false;

		if (hasMintedFive || isMintingEnded) canMint = false;
		else {
			if (haveBeenMinted < supplyLimit) {
				//If user is whitelisted
				if (isWhitelisted) {
					canMint = canMintUserWhitelisted(
						isWhitelistOpen,
						isPublicOpen,
						amountMinted,
						hasMintedFive
					);

					//If user isn't whitelisted
				} else {
					if (isPublicOpen && !hasMintedFive) canMint = true;
					else canMint = false;
				}
			}
		}

		const status = {
			address,
			canMint: canMint && isProfileRegistered,
			isWhitelisted,
			amountMinted,
			isProfileRegistered,
			hasMintedFive,
		};

		return { status, ...generalConfigs };
	} catch (err) {
		return err;
	}
};

/**
 * @dev Decides canMint value (bool) of a whitelisted user
 */
const canMintUserWhitelisted = (
	isWhitelistOpen,
	isPublicOpen,
	amountMinted,
	hasMintedFive
) => {
	//If whitelist minting is still closed
	if (!isWhitelistOpen) return false;

	//If user hasnt minted yet and public is closed
	if (amountMinted === 0 && !isPublicOpen) return true;

	//If user has minted once and public is closed
	if (amountMinted === 1 && !isPublicOpen) return false;

	//If user hasnt minted 5 and public is open
	if (!hasMintedFive && isPublicOpen) return true;

	//Otherwise,
	//(this is most likely will never be called)
	return false;
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
	getGenesisBehavior,
};
