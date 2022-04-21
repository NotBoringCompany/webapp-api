const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

const moralisAPINode = process.env.MORALIS_APINODE;
const pvtKey = process.env.PRIVATE_KEY_1;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const genesisNBMonABI =  fs.readFileSync(path.resolve(__dirname, "../abi/genesisNBMon.json"));
const genesisABI = JSON.parse(genesisNBMonABI);
const genesisContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, genesisABI, customHttpProvider);