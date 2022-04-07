const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

const moralisAPINode = process.env.MORALIS_APINODE;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const genesisNBMonABI =  fs.readFileSync(path.resolve(__dirname, "../abi/genesisNBMon.json"));
const genesisABI = JSON.parse(genesisNBMonABI);
// current test genesis contract = '0xa08E79512092CC7e381C341140f2Ded612b79bC6'
const genesisContract = new ethers.Contract('0xa08E79512092CC7e381C341140f2Ded612b79bC6', genesisABI, customHttpProvider);