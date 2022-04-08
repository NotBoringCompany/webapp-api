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
// current test genesis contract = "0xa08E79512092CC7e381C341140f2Ded612b79bC6"
const genesisContract = new ethers.Contract("0xa08E79512092CC7e381C341140f2Ded612b79bC6", genesisABI, customHttpProvider);

const whitelistedMint = async (addr) => {
    try {
        const signer = new ethers.Wallet(pvtKey, customHttpProvider);
        let owner = addr;
        let amountToMint = 1;
        let hatchingDuration = 300;
        let nbmonStats = [];
        let types = [];
        let potential = [];
        let passives = [];
        let isEgg = true;

        let unsignedTx = await genesisContract.populateTransaction
            .whitelistedGenesisEggMint(
                owner, 
                amountToMint, 
                hatchingDuration, 
                nbmonStats, 
                types, 
                potential, 
                passives, 
                isEgg
                );
        let response = await signer.sendTransaction(unsignedTx);
        await response.wait();
        return response;
    } catch (err) {
        return err.message;
    }
}

module.exports = {whitelistedMint};