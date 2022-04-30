require("dotenv").config();
const AWS = require("aws-sdk");
const Moralis = require("moralis/node");
const moment = require("moment");

const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);

const s3 = new AWS.S3({
	endpoint: spacesEndpoint.href,
	credentials: new AWS.Credentials({
		accessKeyId: process.env.SPACES_KEY,
		secretAccessKey: process.env.SPACES_SECRET,
	}),
});

/**
 * @dev This will upload the metadata of the EGG to Spaces. Will contain mostly empty stats/attributes.
 * @param {*} id resembles the NBMon ID of the metadata to be created for.
 */
const uploadGenesisEggMetadata = (id, hatchingDuration) => {
	// contains the metadata of the egg
	const metadata = {
		name: `NBMon Egg #${id}`,
		description: "This egg contains a mysterious NBMon. Hatch it to find out.",
		image: "https://nbcompany.fra1.digitaloceanspaces.com/genesisEgg.png",
		attributes: [
			{
				display_type: "date",
				trait_type: "Born on",
				value: moment().unix(),
			},
			{
				display_type: "date",
				trait_type: "Hatchable on",
				value: moment().unix() + hatchingDuration,
			},
		],
	};

    // creates a new object in the bucket
	s3.putObject(
		{
			Bucket: process.env.SPACES_NAME,
			Key: `genesisNBMon/${id}.json`,
			Body: JSON.stringify(metadata),
			ACL: "public-read",
			ContentType: "application/json",
		},
		(err, data) => {
			if (err) throw new Error(err.stack);
			return `genesisNBMon/${id}.json has been successfully created.`
		}
	);
};

/**
 * @dev This will delete the egg metadata from S3 and create a new object with the original filepath with updated stats.
 * @dev This function is called when a user hatches their NBMon
 * @param {*} id resembles the NBMon ID of the metadata to be created for.
 */
const uploadGenesisHatchedMetadata = async (id, genus) => {

    const paramObj = {
        Bucket: process.env.SPACES_NAME,
        Key: `genesisNBMon/${id}.json`
    }

    try {
        // before deleting the object, checks if object exists within bucket.
        await s3.headObject(paramObj).promise();
        try {
            // deletes the specified object.
            await s3.deleteObject(
                paramObj, 
                (err) => {
                    if (err) throw new Error(err.stack);  
                }
            ).promise();
        } catch (err) {
            return err;
        }

        // gets description of genus from Moralis DB
        

        const newMetadata = {
            name: `NBMon #${id} - ${genus}`,
            // gets from moralis
            description: ``
        }

    } catch (err) {
        return err;
    }
};

uploadGenesisHatchedMetadata(14);
module.exports = {
	uploadGenesisEggMetadata,
};
