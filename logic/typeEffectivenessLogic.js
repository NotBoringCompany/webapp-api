const Moralis = require('moralis/node');
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

/**
 * @dev Helper function to parse object data into a JSON string
 */
const parseJSON = (data) => JSON.parse(JSON.stringify(data));

const testQuery = async () => {
    try {
        const attackQuery = Moralis.Object.extend("Types_Attack");
        const query = new Moralis.Query(attackQuery);
        query.equalTo("Attacking_Type", "Ordinary")
        const res = await query.find();
        return parseJSON(res);
    } catch (err) {
        return err;
    }
}

const getAttackEffectiveness = async (firstType, secondType, isGenesis) => {
    try {

        if (secondType === "null") {
            secondType = null;
        }
        const TypesAttack = Moralis.Object.extend("Types_Attack");
        const attackQuery = new Moralis.Query(TypesAttack);
        const firstTypeQuery = attackQuery.equalTo("Attacking_Type", firstType);
        const firstTypeQueryRes = await firstTypeQuery.find({ useMasterKey: true });
        const secondTypeQuery = secondType !== null ? attackQuery.equalTo("Attacking_Type", secondType) : null;
        const secondTypeQueryRes = secondTypeQuery !== null 
            ? await secondTypeQuery.find({ useMasterKey: true }) 
            : null;
        let nbmonStrongAgainst = [];
        let nbmonWeakAgainst = [];

        // if nbmon is genesis, we use genesisContract.
        if (isGenesis === "true") {
            // if nbmon has two types
            if (firstType !== null && secondType !== null) {
                allTypes.forEach((receivingType, index) => {
                    let idx = Array.from(parseJSON(firstTypeQueryRes)).findIndex(type => type["Receiving_Type"] === receivingType);
                    let secondIdx = Array.from(parseJSON(secondTypeQueryRes)).findIndex(type => type.Receiving_Type === receivingType);
                    console.log(secondIdx);
                    let firstTypeAttackEff = parseFloat(parseJSON(firstTypeQueryRes[idx])["Effectiveness"]);
                    let secondTypeAttackEff = parseFloat(parseJSON(secondTypeQueryRes[secondIdx])["Effectiveness"]);
                    let attackEff = firstTypeAttackEff * secondTypeAttackEff;

                    console.log(attackEff);
                    
                    if (attackEff > 1) {
                        nbmonStrongAgainst.push(type);
                    } else {
                        nbmonWeakAgainst.push(type);
                    }
                })
            // if nbmon has only one type
            } else if (firstType !== null && secondType === null) {
                allTypes.forEach((type, index) => {
                    let attackEff = parseFloat(parseJSON(firstTypeQueryRes[index])["Effectiveness"]);
                    console.log(parseJSON(firstTypeQueryRes[index]), type, attackEff);
                    if (attackEff > 1) {
                        nbmonStrongAgainst.push(type);
                    } else {
                        nbmonWeakAgainst.push(type);
                    }
                })
            // if the nbmon is still an egg, both first and second type will be null.
            // this doesn't check if first type doesn't exist and second type exists since that would never happen.
            } else {
                return "Still an egg. Please hatch the NBMon to show its attack effectiveness.";
            }
            console.log(nbmonStrongAgainst, nbmonWeakAgainst);
        // if nbmon is not genesis, then we will use the normal nbmon contract.
        } else {
            return "NBMon is not Genesis. Code not implemented yet.";
        }
    } catch (err) {
        return err;
    }
}

// // get nbmon's strengths and weaknesses against other types when attacking
// const getAttackEffectiveness = async (firstType, secondType, isGenesis) => {
//     try {
//         // defense and attack effectiveness are stored in separate databases
//         const attackQuery = new Moralis.Query("Types_Attack");

//         let nbmonStrongAgainst = [];
//         let nbmonWeakAgainst = [];
        
//         // if nbmon is genesis, we use genesisContract.
//         if (isGenesis === "true") {
//             // if both first and second types exist
//             if (firstType !== null && secondType !== null) {
//                 for (let i = 0; i < allTypes.length; i++) {
//                     let firstTypeAttackPipeline = [
//                         { match: { Attacking_Type: firstType, Receiving_Type: allTypes[i] } },
//                         { project: { _id: 0, Attacking_Type: 1, Receiving_Type: 1, Effectiveness: 1 } }
//                     ];
//                     let secondTypeAttackPipeline = [
//                         { match: { Attacking_Type: secondType, Receiving_Type: allTypes[i] } },
//                         { project: { _id: 0, Attacking_Type: 1, Receiving_Type: 1, Effectiveness: 1 } }
//                     ];

//                     const firstTypeAttackAggRes = await attackQuery.aggregate(firstTypeAttackPipeline);
//                     const secondTypeAttackAggRes = await attackQuery.aggregate(secondTypeAttackPipeline);

//                     let attackEff = firstTypeAttackAggRes[0]["Effectiveness"] * secondTypeAttackAggRes[0]["Effectiveness"];

//                     if (attackEff > 1) {
//                         nbmonStrongAgainst.push(allTypes[i]);
//                     } else if (attackEff < 1) {
//                         nbmonWeakAgainst.push(allTypes[i]);
//                     }
//                 }
//             // if first type exists but second type doesn't
//             } else if (firstType !== null && secondType === null) {
//                 for (let i = 0; i < allTypes.length; i++) {
//                     let firstTypeAttackPipeline = [
//                         { match: { Attacking_Type: firstType, Receiving_Type: allTypes[i] } },
//                         { project: { _id: 0, Attacking_Type: 1, Receiving_Type: 1, Effectiveness: 1 } }
//                     ];

//                     const firstTypeAttackAggRes = await attackQuery.aggregate(firstTypeAttackPipeline);

//                     if (firstTypeAttackAggRes[0]["Effectiveness"] > 1) {
//                         nbmonStrongAgainst.push(allTypes[i]);
//                     } else if (firstTypeAttackAggRes[0]["Effectiveness"] < 1) {
//                         nbmonWeakAgainst.push(allTypes[i]);
//                     }
//                 }
//             // if the nbmon is still an egg, both first and second type will be null.
//             // this doesn't check if first type doesn't exist and second type exists since that would never happen.
//             } else {
//                 return "Still an egg. Please hatch the NBMon to show its attack effectiveness.";
//             }

//             return {
//                 'Strong against': nbmonStrongAgainst,
//                 'Weak against': nbmonWeakAgainst
//             }
//         // if nbmon is not genesis, then we will use the normal nbmon contract.
//         } else {
//             // contract not ready yet. when ready, it will be implemented here.
//             return "NBMon is not Genesis. Code not implemented yet.";
//         }
//     } catch (err) {
//         return err;
//     }
// }

// get nbmon's defense resistance and vulnerability when defending
const getDefenseEffectiveness = async (firstType, secondType, isGenesis) => {
    try {
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

module.exports = { getAttackEffectiveness, getDefenseEffectiveness, testQuery };