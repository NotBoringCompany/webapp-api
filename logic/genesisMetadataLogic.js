require('dotenv').config();
const AWS = require("aws-sdk");

const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);

const s3 = new AWS.S3({
    endpoint: spacesEndpoint.href, 
    credentials: new AWS.Credentials({
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET
    })
});

/**
 * @dev This will upload the metadata of the EGG to Spaces. Will contain mostly empty stats/attributes.    
 * @param {id} id resembles the NBMon ID of the metadata to be created for.
 */
const uploadGenesisEggMetadata = (id) => {

    // contains the metadata of the egg
    const metadata = {
        "name": `NBMon Egg #${id}`,
        "description": "This egg contains a mysterious NBMon. Hatch it to find out.",
        "image": "https://nbcompany.fra1.digitaloceanspaces.com/genesisEgg.png"
    };

    s3.putObject({
        Bucket: process.env.SPACES_NAME,
        Key: `genesisNBMon/${id}.json`,
        Body: JSON.stringify(metadata),
        ACL: "public-read",
        ContentType: "application/json"
    }, (err, data) => {
        if (err) throw new Error(err.stack);
        console.log("File uploaded successfully!", data);
    });
}

module.exports = {
    uploadGenesisEggMetadata
};
