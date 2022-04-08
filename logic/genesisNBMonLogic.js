const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const moralisAPINode = process.env.MORALIS_APINODE;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const genesisNBMonABI =  fs.readFileSync(path.resolve(__dirname, "../abi/genesisNBMon.json"));
const genesisABI = JSON.parse(genesisNBMonABI);
// current test genesis contract = '0xa08E79512092CC7e381C341140f2Ded612b79bC6'
const genesisContract = new ethers.Contract('0xa08E79512092CC7e381C341140f2Ded612b79bC6', genesisABI, customHttpProvider);

const getGenesisNBMon = async (id) => {
    let nbmonObj = {};
    const nbmon = await genesisContract.getGenesisNBMon(id);

    nbmonObj["NBMon ID"] = parseInt(Number(nbmon[0]));
    nbmonObj["Owner address"] = nbmon[1];
    /**
     * @dev Checks if isEgg is true or false (nbmon[9]).
     */
    if (nbmon[9] === true) {
        const bornAt = moment.unix(parseInt(Number(nbmon[2])));
        nbmonObj["Born at"] = bornAt.toString();
    } else {
        const hatchedAt = moment.unix(parseInt(Number(nbmon[2])));
        nbmonObj["Egg hatched at"] = hatchedAt.toString();
    }
    nbmonObj["Transferred at"] = moment.unix(parseInt(Number(nbmon[3]))).toString();
    nbmonObj["Hatching duration"] = nbmon[4] + " seconds";
    /**
     * @dev Will most likely only show when hatched, hence the extra check for null values.
     */
    nbmonObj["Gender"] = nbmon[5][0] == null ? "N/A" : nbmon[5][0];
    nbmonObj["Rarity"] = nbmon[5][1] == null ? "N/A" : nbmon[5][1];
    nbmonObj["Mutation"] = nbmon[5][2] == null ? "N/A" : nbmon[5][2];
    nbmonObj["Species"] = nbmon[5][3] == null ? "N/A" : nbmon[5][3];
    nbmonObj["Genus"] = nbmon[5][4] == null ? "N/A" : nbmon[5][4];
    nbmonObj["Fertility"] = nbmon[5][5] == null ? "N/A" : nbmon[5][5];
    nbmonObj["First type"] = nbmon[6][0] == null ? "N/A" : nbmon[6][0];
    nbmonObj["Second type"] = nbmon[6][1] == null ? "N/A" : nbmon[6][1];
    nbmonObj["Health potential"] = nbmon[7][0] == null ? "N/A" : nbmon[7][0];
    nbmonObj["Energy potential"] = nbmon[7][1] == null ? "N/A" : nbmon[7][1];
    nbmonObj["Attack potential"] = nbmon[7][2] == null ? "N/A" : nbmon[7][2];
    nbmonObj["Defense potential"] = nbmon[7][3] == null ? "N/A" : nbmon[7][3];
    nbmonObj["Special attack potential"] = nbmon[7][4] == null ? "N/A" : nbmon[7][4];
    nbmonObj["Special defense potential"] = nbmon[7][5] == null ? "N/A" : nbmon[7][5];
    nbmonObj["Speed potential"] = nbmon[7][6] == null ? "N/A" : nbmon[7][6];
    nbmonObj["First passive"] = nbmon[8][0] == null ? "N/A" : nbmon[8][0];
    nbmonObj["Second passive"] = nbmon[8][1] == null ? "N/A" : nbmon[8][1];
    nbmonObj["Is an egg"] = nbmon[9];

    return nbmonObj;
}

module.exports = {getGenesisNBMon};