const Moralis = require("moralis/node");

const getUserActivities = async (address) => {
	try {
		const nftTransfers = Moralis.Object.extend("NFTTransfers");
		const nftTranfersQuery = new Moralis.Query(nftTransfers);

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
		const groupByDateWithoutTime = `${new Date(
			obj.timestamp.iso
		).getDate()}.${new Date(obj.timestamp.iso).getMonth()}.${new Date(
			obj.timestamp.iso
		).getFullYear()}`;
		const newTimeStamp = new Date(obj.timestamp.iso);

		if (groupByDateWithoutTime in objectStore) {
			objectStore[groupByDateWithoutTime].data.push({
				...obj,
				timestamp: newTimeStamp,
			});
		} else {
			objectStore[groupByDateWithoutTime] = {
				data: [
					{
						...obj,
						timestamp: newTimeStamp,
					},
				],
				date: groupByDateWithoutTime,
			};
		}

		return objectStore;
	});

	return Object.keys(objectStore).map((key) => objectStore[key]);
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
		const { from_address, to_address, block_timestamp } = jsonResult;

		console.log("result:");
		console.log(jsonResult);
		console.log(block_timestamp);
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
		newTransfer.set("timestamp", block_timestamp);

		//Saving user master key (due to CLP being only "read" for only public)
		await newTransfer.save(null, { useMasterKey: true });

		console.log("saved to NFTTransfers - can be used as activities!");
	} catch (err) {
		return err;
	}
};

module.exports = {
	getUserActivities,
	addToActivities,
};
