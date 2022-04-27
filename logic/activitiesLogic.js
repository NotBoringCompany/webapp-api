const moment = require("moment");
const Moralis = require("moralis/node");

const InputDataDecoder = require("ethereum-input-data-decoder");
const genesisNBMonABI = require(`${__dirname}/../abi/genesisNBMon.json`);
const decoder = new InputDataDecoder(genesisNBMonABI);

const getUserActivities = async (address) => {
	//At the moment, this only gets the user's activities where they receive (buy / mint) NFTs
	//and when user hatches the egg
	try {
		const activities = Moralis.Object.extend("UserTransactionsActivities");
		const activitiesQuery = new Moralis.Query(activities);

		activitiesQuery.equalTo("address_activity_owner", address.toLowerCase());

		const queryResult = await activitiesQuery.find({ useMasterKey: true });
		let jsonQueryResult = JSON.parse(JSON.stringify(queryResult));

		return groupByDate(jsonQueryResult);
	} catch (err) {
		return err;
	}
};

const groupByDate = (jsonQueryResult) => {
	let objectStore = {};

	jsonQueryResult.map((obj) => {
		const groupByDateWithoutTime = `${moment(
			new Date(obj.timestamp.iso)
		).format("DD")} ${moment(new Date(obj.timestamp.iso)).format(
			"MMMM"
		)} ${moment(new Date(obj.timestamp.iso)).format("YYYY")}`;

		const newTimeStamp = new Date(obj.timestamp.iso);

		if (groupByDateWithoutTime in objectStore) {
			objectStore[groupByDateWithoutTime].data.push({
				...obj,
				timestamp: newTimeStamp,
				utcTime: moment(newTimeStamp).utcOffset(0).format("HH:mm"),
			});
		} else {
			objectStore[groupByDateWithoutTime] = {
				data: [
					{
						...obj,
						timestamp: newTimeStamp,
						utcTime: moment(newTimeStamp).utcOffset(0).format("HH:mm"),
					},
				],
				dateGroup: groupByDateWithoutTime,
			};
		}

		return objectStore;
	});

	return Object.keys(objectStore)
		.map((key) => objectStore[key])
		.reverse(); // return grouped by its date - this is to fulfil the frontend's (UI) requirement
};

/**
 * @dev Saves newly generated hatching key to DB
 * This key is to be checked later after the hatching has finished.
 * It's a part of adding a "hatching event" to the user's activities.
 * See addToActivities(), checkHatchingKeyValid() & invalidateHatchingKey().
 */

const saveHatchingKey = async (key) => {
	const hatchingKeys = Moralis.Object.extend("HatchingKeys");
	const newHatchingKey = new hatchingKeys();
	newHatchingKey.set("key", key);
	newHatchingKey.set("addedToActivity", false);

	await newHatchingKey.save(null, { useMasterKey: true }).catch((err) => err);
};

const addToActivities = async (
	transactionHash,
	transactionType,
	network,
	value
) => {
	try {
		//if genesis minting (NFT transfers)
		if (transactionType === "genesisMinting") {
			const ethNFTTransfers = Moralis.Object.extend("EthNFTTransfers");
			const ethNFTQuery = new Moralis.Query(ethNFTTransfers);

			ethNFTQuery.equalTo("transaction_hash", transactionHash);
			const queryResult = await ethNFTQuery.first({ useMasterKey: true });

			const jsonResult = JSON.parse(JSON.stringify(queryResult));
			const { from_address, to_address, block_timestamp } = jsonResult;

			//insert into our custom-made Class "UserTransactionsActivities", so can be displayed as activities in the frontend
			const NFTTransfer = Moralis.Object.extend("UserTransactionsActivities");
			const newTransfer = new NFTTransfer();

			//because the NFT transfer is from "us" to the "customer"
			//so the owner  of this activity (to be displayed in their account)
			//is the "to" address; which is the "customer"

			newTransfer.set("address_activity_owner", to_address);

			newTransfer.set("address_from", from_address);
			newTransfer.set("address_to", to_address);

			newTransfer.set("transaction_hash", transactionHash);
			newTransfer.set("transaction_type", transactionType);
			newTransfer.set("network", network);
			newTransfer.set("value", value.toString());
			newTransfer.set("timestamp", block_timestamp);

			//Saves using master key (due to CLP being only "read" for only public)
			await newTransfer.save(null, { useMasterKey: true });
		} else {
			// Only for hatching activity (for now)
			// Will be called from Frontend because hatching is done from there

			const hatchingKey = await checkHatchingKeyValid(transactionHash);

			const { valid, data, decodedKey } = hatchingKey;

			if (valid) {
				const { from_address, to_address, block_timestamp } = data;
				//insert into our custom-made Class "UserTransactionsActivities", so can be displayed as activities in the frontend
				const activity = Moralis.Object.extend("UserTransactionsActivities");
				const newActivity = new activity();

				newActivity.set("address_activity_owner", from_address);

				newActivity.set("address_from", from_address);
				newActivity.set("address_to", to_address);
				newActivity.set("transaction_hash", transactionHash);
				newActivity.set("transaction_type", transactionType);
				newActivity.set("network", network);
				newActivity.set("value", value.toString());
				newActivity.set("timestamp", block_timestamp);

				//Saves using master key (due to CLP being only "read" for only public)
				await newActivity
					.save(null, { useMasterKey: true })
					.catch((err) => err);

				await invalidateHatchingKey(decodedKey);

				return { status: "ok", message: "activity added" };
			} else {
				throw new Error("Hatching key is invalid");
			}
		}
	} catch (err) {
		throw new Error(err.stack);
	}
};

/**
 * @dev Checks if hatching key is valid
 * Valid means:
 * 1. an egg has been hatched with that key and,
 * 2. this hatching "event" hasn't been added to the user's activity
 */

const checkHatchingKeyValid = async (hash) => {
	const ethTransactions = Moralis.Object.extend("EthTransactions");
	const ethTransactionQuery = new Moralis.Query(ethTransactions);
	ethTransactionQuery.equalTo("hash", hash);
	const queryResult = await ethTransactionQuery.first({ useMasterKey: true });

	if (!queryResult)
		return {
			valid: false,
			data: null,
			decodedKey: null,
		};

	const ethTransactionResult = JSON.parse(JSON.stringify(queryResult));

	//Checks from all hatching keys that are valid
	const hatchingKeys = Moralis.Object.extend("HatchingKeys");
	const hatchingKeyQuery = new Moralis.Query(hatchingKeys);

	const hatchingKeyFromTransactionInput = decoder.decodeData(
		ethTransactionResult.input
	).inputs[0];

	hatchingKeyQuery.equalTo("key", hatchingKeyFromTransactionInput);
	hatchingKeyQuery.equalTo("addedToActivity", false);

	const hatchingQueryResult = await hatchingKeyQuery.first({
		useMasterKey: true,
	});

	if (hatchingQueryResult) {
		return {
			valid: true,
			data: ethTransactionResult,
			decodedKey: hatchingKeyFromTransactionInput,
		};
	}
	return {
		valid: false,
		data: null,
		decodedKey: null,
	};
};

/**
 * @dev Invalidates hatching key in DB by changing "addedToActivity" field to true
 * This is to make sure that no same activity can be added twice
 */
const invalidateHatchingKey = async (key) => {
	const hatchingKeys = Moralis.Object.extend("HatchingKeys");
	const hatchingKeyQuery = new Moralis.Query(hatchingKeys);

	hatchingKeyQuery.equalTo("key", key);

	const hatchingQueryResult = await hatchingKeyQuery.first({
		useMasterKey: true,
	});

	if (hatchingQueryResult) {
		hatchingQueryResult.set("addedToActivity", true);
	}

	await hatchingQueryResult.save({ useMasterKey: true });
};

module.exports = {
	getUserActivities,
	addToActivities,
	saveHatchingKey,
};
