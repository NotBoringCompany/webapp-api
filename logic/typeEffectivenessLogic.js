const Moralis = require('moralis/node');

// Moralis credentials
const serverUrl = process.env.MORALIS_SERVERURL;
const appId = process.env.MORALIS_APPID;
const masterKey = process.env.MORALIS_MASTERKEY;

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

// get nbmon's strengths and weaknesses against other types when attacking
const getAttackEffectiveness = async (firstType, secondType, isGenesis) => {
    try {
        await Moralis.start({ serverUrl, appId, masterKey });

        // defense and attack effectiveness are stored in separate databases
        const attackQuery = new Moralis.Query("Types_Attack");

        let nbmonStrongAgainst = [];
        let nbmonWeakAgainst = [];
        
        // if nbmon is genesis, we use genesisContract.
        if (isGenesis === "true") {
            // if both first and second types exist
            if (firstType !== null && secondType !== null) {
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
            } else if (firstType !== null && secondType === null) {
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
            // if the nbmon is still an egg, both first and second type will be null.
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

// get nbmon's defense resistance and vulnerability when defending
const getDefenseEffectiveness = async (firstType, secondType, isGenesis) => {
    try {
        await Moralis.start({ serverUrl, appId, masterKey });

        const defenseQuery = new Moralis.Query("Types_Defense");

        let nbmonResistantTo = [];
        let nbmonVulnerableTo = [];

        if (isGenesis === "true") {
            // if both first and second types exist
            if (firstType !== null && secondType !== null) {
                for (let i = 0; i < allTypes.length; i++) {
                    let firstTypeDefensePipeline = [
                        { match: { Receiving_Type: firstType, Attacking_Type: allTypes[i] } },
                        { project: { _id: 0, Receiving_Type: 1, Attacking_Type: 1, Effectiveness: 1 } }
                    ];
                    let secondTypeDefensePipeline = [
                        { match: { Receiving_Type: secondType, Attacking_Type: allTypes[i] } },
                        { project: { _id: 0, Receiving_Type: 1, Attacking_Type: 1, Effectiveness: 1 } }
                    ];

                    const firstTypeDefenseAggRes = await defenseQuery.aggregate(firstTypeDefensePipeline);
                    const secondTypeDefenseAggRes = await defenseQuery.aggregate(secondTypeDefensePipeline);

                    let defenseEff = firstTypeDefenseAggRes[0]["Effectiveness"] * secondTypeDefenseAggRes[0]["Effectiveness"];

                    if (defenseEff < 1) {
                        nbmonResistantTo.push(allTypes[i]);
                    } else if (defenseEff > 1) {
                        nbmonVulnerableTo.push(allTypes[i]);
                    }
                }
            // if nbmon only has one type
            } else if (firstType !== null && secondType === null) {
                for (let i = 0; i < allTypes.length; i++) {
                    let firstTypeDefensePipeline = [
                        { match: { Receiving_Type: firstType, Attacking_Type: allTypes[i] } },
                        { project: { _id: 0, Receiving_Type: 1, Attacking_Type: 1, Effectiveness: 1 } }
                    ];

                    const firstTypeDefenseAggRes = await defenseQuery.aggregate(firstTypeDefensePipeline);

                    if (firstTypeDefenseAggRes[0]["Effectiveness"] < 1) {
                        nbmonResistantTo.push(allTypes[i]);
                    } else if (firstTypeDefenseAggRes[0]["Effectiveness"] > 1) {
                        nbmonVulnerableTo.push(allTypes[i]);
                    }
                }
            // if the nbmon is still an egg, both first and second type will be null.
            // this doesn't check if first type doesn't exist and second type exists since that would never happen.
            } else {
                return "Still an egg. Please hatch the NBMon to show its defense effectiveness.";
            }

            return {
                'Resistant to': nbmonResistantTo,
                'Vulnerable to': nbmonVulnerableTo
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

module.exports = { getAttackEffectiveness, getDefenseEffectiveness };