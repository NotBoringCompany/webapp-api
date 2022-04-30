require("dotenv").config();
const AWS = require("aws-sdk");
const Moralis = require("moralis/node");
const moment = require("moment");

const { getGenesisNBMon } = require("./genesisNBMonLogic");

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
                // born on may be slightly different than the smart contract's bornAt due to the nature of the code.
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
		(err) => {
			if (err) throw new Error(err.stack);
			return `genesisNBMon/${id}.json has been successfully created.`
		}
	);
};

/**
 * @dev This will delete the egg metadata from S3 and create a new object with the original filepath with updated stats.
 * 
 * This function is called when a user hatches their NBMon.
 * 
 * @param {*} id resembles the NBMon ID of the metadata to be created for.
 */
const uploadGenesisHatchedMetadata = async (id) => {

    try {
        const paramObj = {
            Bucket: process.env.SPACES_NAME,
            Key: `genesisNBMon/${id}.json`
        }

        // gets description of genus from Moralis DB
        const nbmon = await getGenesisNBMon(id);
        const genus = nbmon["genus"];
        const genusDesc = nbmon["genusDescription"];
        const isEgg = nbmon["isEgg"];

        // first checks if `id` has been hatched before (will get saved in Hatched_Metadata DB).
        const hatchedQuery = new Moralis.Query("Hatched_Metadata");
        const hatchedPipeline = [
            { match: { nbmonId: id } },
            { project: { _id: 0, nbmonId: 1 } }
        ];
        const hatchedAggRes = await hatchedQuery.aggregate(hatchedPipeline);

        // if id doesn't exist in DB (meaning that it hasn't been hatched before)
        if (hatchedAggRes.length !== 0) {
            // double checking that isEgg is still true.
            if (isEgg === true) {
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

                const newMetadata = {
                    name: `NBMon #${id} - ${genus}`,
                    // gets from moralis
                    description: genusDesc,
                    image: `https://nbcompany.fra1.digitaloceanspaces.com/genesisGenera/${genus}.png`,
                    attributes: [
                        {
                            display_type: "date",
                            trait_type: "Hatched on",
                            // born on may be slightly different than the smart contract's bornAt due to the nature of the code.
                            value: nbmon["hatchedAt"]
                        },
                        {
                            trait_type: "First Type",
                            value: nbmon["types"][0]
                        },
                        {
                            trait_type: "Second Type",
                            value: nbmon["types"][1]
                        },
                        {
                            trait_type: "Health Potential",
                            value: nbmon["healthPotential"]
                        },
                        {
                            trait_type: "Energy Potential",
                            value: nbmon["energyPotential"]
                        },
                        {
                            trait_type: "Attack Potential",
                            value: nbmon["attackPotential"]
                        },
                        {
                            trait_type: "Defense Potential",
                            value: nbmon["defensePotential"]
                        },
                        {
                            trait_type: "Special Attack Potential",
                            value: nbmon["spAtkPotential"]
                        },
                        {
                            trait_type: "Special Defense Potential",
                            value: nbmon["spDefPotential"]
                        },
                        {
                            trait_type: "Speed Potential",
                            value: nbmon["speedPotential"]
                        },
                        {
                            trait_type: "Passive One",
                            value: nbmon["passives"][0]
                        },
                        {
                            trait_type: "Passive Two",
                            value: nbmon["passives"][1]
                        }
                    ],
                };

                s3.putObject(
                    {
                        Bucket: process.env.SPACES_NAME,
                        Key: `genesisNBMon/${id}.json`,
                        Body: JSON.stringify(newMetadata),
                        ACL: "public-read",
                        ContentType: "application/json"
                    },
                    (err) => {
                        if (err) throw new Error(err.stack);
                        return `genesisNBMon/${id}.json has been successfully created.`
                    }
                );
            } else {
                return "isEgg is apparently already set to false. Please double check"
            }
        } else {
            return "Egg has already been hatched. Upload metadata to Spaces failed."
        }
    } catch (err) {
        return err;
    }
};

const serverUrl = process.env.MORALIS_SERVERURL;
const appId = process.env.MORALIS_APPID;
const masterKey = process.env.MORALIS_MASTERKEY;

const hatchedMetadata = async (id) => {
    await Moralis.start({ serverUrl, appId, masterKey });
    const hatchedQuery = new Moralis.Query("Hatched_Metadata");
    const hatchedPipeline = [
        { match: { nbmonId: id } },
        { project: { _id: 0, nbmonId: 1 } }
    ];

    const hatchedAggRes = await hatchedQuery.aggregate(hatchedPipeline);

    console.log(hatchedAggRes.length === 0);
}

hatchedMetadata(2);

module.exports = {
	uploadGenesisEggMetadata,
    uploadGenesisHatchedMetadata
};
