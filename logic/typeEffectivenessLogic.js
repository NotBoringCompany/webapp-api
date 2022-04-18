const ethers = require("ethers");
const Moralis = require('moralis/node');
const fs = require("fs");
const path = require("path");

// Moralis credentials
const serverUrl = process.env.MORALIS_SERVERURL;
const appId = process.env.MORALIS_APPID;
const masterKey = process.env.MORALIS_MASTERKEY;

const moralisAPINode = process.env.MORALIS_APINODE;
// rinkeby URL connected with Moralis
const nodeURL = `https://speedy-nodes-nyc.moralis.io/${moralisAPINode}/eth/rinkeby`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(nodeURL);

const genesisNBMonABI = fs.readFileSync(
	path.resolve(__dirname, "../abi/genesisNBMon.json")
);
const genesisABI = JSON.parse(genesisNBMonABI);
const genesisContract = new ethers.Contract(
	process.env.CONTRACT_ADDRESS,
	genesisABI,
	customHttpProvider
);

let allTypes = [
    "Ordinary", 
    "Fire", 
    "Water", 
    "Electric", 
    "Earth", 
    "Wind", 
    "Frost", 
    "Crystal", 
    "Nature", 
    "Brawler", 
    "Spirit", 
    "Magic", 
    "Psychic", 
    "Reptile", 
    "Toxic"
];

// get types' strengths and weaknesses against other types when attacking
const getAttackEffectiveness = async (id, isGenesis) => {
    try {
        await Moralis.start({ serverUrl, appId, masterKey });

        // defense and attack effectiveness are stored in separate databases
        const attackQuery = new Moralis.Query("Types_Attack");

        let nbmonStrongAgainst = [];
        let nbmonWeakAgainst = [];
        
        // if nbmon is genesis, we use genesisContract.
        if (isGenesis === "true") {
            const nbmon = await genesisContract.getGenesisNBMon(id);

            // if the nbmon is still an egg, the first and second types are still undefined.
            let firstType = nbmon[6][0] === undefined ? null : nbmon[6][0];
            let secondType = nbmon[6][1] === undefined ? null : nbmon[6][1];

            // if both first and second types exist
            if (firstType !== undefined && secondType !== undefined) {
                for (let i = 0; i < allTypes.length; i++) {
                    let firstTypeAttackPipeline = [
                        { match: { Attacking_Type: firstType, Receiving_Type: allTypes[i] } },
                        { project: { _id: 0, Attacking_Type: 1, Receiving_Type: 1, Effectiveness: 1 } }
                    ];
                    let secondTypeAttackPipeline = [
                        { match: { Attacking_Type: secondType, Receiving_Type: allTypes[i] } },
                        { project: { _id: 0, Attacking_Type: 1, Receiving_Type: 1, Effectiveness: 1 } }
                    ];

                    const firstTypeAttackAggRes = await attackQuery.aggregate(firstTypeAttackPipeline);
                    const secondTypeAttackAggRes = await attackQuery.aggregate(secondTypeAttackPipeline);

                    let attackEff = firstTypeAttackAggRes[0]["Effectiveness"] * secondTypeAttackAggRes[0]["Effectiveness"];

                    if (attackEff > 1) {
                        nbmonStrongAgainst.push(allTypes[i]);
                    } else if (attackEff < 1) {
                        nbmonWeakAgainst.push(allTypes[i]);
                    }
                }
            // if first type exists but second type doesn't
            } else if (firstType !== undefined && secondType === undefined) {
                for (let i = 0; i < allTypes.length; i++) {
                    let firstTypeAttackPipeline = [
                        { match: { Attacking_Type: firstType, Receiving_Type: allTypes[i] } },
                        { project: { _id: 0, Attacking_Type: 1, Receiving_Type: 1, Effectiveness: 1 } }
                    ];

                    const firstTypeAttackAggRes = await attackQuery.aggregate(firstTypeAttackPipeline);

                    if (firstTypeAttackAggRes[0]["Effectiveness"] > 1) {
                        nbmonStrongAgainst.push(allTypes[i]);
                    } else if (firstTypeAttackAggRes[0]["Effectiveness"] < 1) {
                        nbmonWeakAgainst.push(allTypes[i]);
                    }
                }
            // if the nbmon is still an egg, both first and second type will be undefined.
            // this doesn't check if first type doesn't exist and second type exists since that would never happen.
            } else {
                return "Still an egg. Please hatch the NBMon to show its attack effectiveness.";
            }

            return {
                'Strong against': nbmonStrongAgainst,
                'Weak against': nbmonWeakAgainst
            }
        // if nbmon is not genesis, then we will use the normal nbmon contract.
        } else {
            // contract not ready yet. when ready, it will be implemented here.
            return "NBMon is not Genesis. Code not implemented yet.";
        }
    } catch (err) {
        return err;
    }
}

module.exports = { getAttackEffectiveness };