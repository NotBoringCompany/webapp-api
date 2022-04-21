const moment = require("moment");
const Moralis = require("moralis/node");

const getUserActivities = async (address) => {
	//At the moment, this only gets the user's activities where they receive (buy / mint) NFTs
	try {
		const nftTransfers = Moralis.Object.extend("NFTTransfers");
		const nftTranfersQuery = new Moralis.Query(nftTransfers);

		//In the future, to get the full user's activities,
		//the query should be improved to also query for address_from user's address
		//and possibly other things as well if needed.

		nftTranfersQuery.equalTo("address_to", address.toLowerCase());

		const queryResult = await nftTranfersQuery.find({ useMasterKey: true });
		let jsonQueryResult = JSON.parse(JSON.stringify(queryResult));

		return groupByDate(jsonQueryResult);
	} catch (err) {
		return err;
	}
};

const groupByDate = (jsonQuery) => {
	let objectStore = {};

	jsonQuery.map((obj) => {
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

const addToActivities = async (
	transactionHash,
	transactionType,
	network,
	value
) => {
	try {
		const ethNFTTransfers = Moralis.Object.extend("EthNFTTransfers");
		const ethNFTQuery = new Moralis.Query(ethNFTTransfers);

		ethNFTQuery.equalTo("transaction_hash", transactionHash);
		const queryResult = await ethNFTQuery.first({ useMasterKey: true });

		const jsonResult = JSON.parse(JSON.stringify(queryResult));
		const { from_address, to_address, block_timestamp } = jsonResult;

		//add to our custom created Class "NFTTransfers", so can be displayed as activities in the frontend
		const NFTTransfer = Moralis.Object.extend("NFTTransfers");
		const newTransfer = new NFTTransfer();

		newTransfer.set("address_from", from_address);
		newTransfer.set("address_to", to_address);
		newTransfer.set("transaction_hash", transactionHash);
		newTransfer.set("transaction_type", transactionType);
		newTransfer.set("network", network);
		newTransfer.set("value", value.toString());
		newTransfer.set("timestamp", block_timestamp);

		//Saving user master key (due to CLP being only "read" for only public)
		await newTransfer.save(null, { useMasterKey: true });
	} catch (err) {
		return err;
	}
};

module.exports = {
	getUserActivities,
	addToActivities,
};
