const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

const genesisStatRandomizer = require("../calculations/genesisStatRandomizer");

const moralisAPINode = process.env.MORALIS_APINODE;
const pvtKey = process.env.PRIVATE_KEY_1;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const genesisNBMonABI =  fs.readFileSync(path.resolve(__dirname, "../abi/genesisNBMon.json"));
const genesisABI = JSON.parse(genesisNBMonABI);
const genesisContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, genesisABI, customHttpProvider);

// hatches the nbmon from an egg and gives it its respective stats
const hatchNBMon = async (id) => {
    try {
        const gender = await genesisStatRandomizer.randomizeGenesisGender();
        const rarity = await genesisStatRandomizer.randomizeGenesisRarity();
        const genus = await genesisStatRandomizer.randomizeGenesisGenus();
        const mutation = await genesisStatRandomizer.randomizeGenesisMutation(genus);
        const species = "Origin";
        const fertility = 3000;
        
    } catch (err) {
        return err;
    }
}