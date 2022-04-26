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

const getAttackEffectiveness = async (firstType, secondType) => {
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

        // if nbmon has two types
        if (firstType !== null && secondType !== null) {
            allTypes.forEach((receivingType) => {
                let idx = parseJSON(firstTypeQueryRes).findIndex((type) => type["Receiving_Type"] === receivingType);
                let secondIdx = parseJSON(secondTypeQueryRes).findIndex(type => type["Receiving_Type"] === receivingType);
                let firstTypeAttackEff = parseFloat(parseJSON(firstTypeQueryRes[idx])["Effectiveness"]);
                let secondTypeAttackEff = parseFloat(parseJSON(secondTypeQueryRes[secondIdx])["Effectiveness"]);
                let attackEff = firstTypeAttackEff * secondTypeAttackEff;
                if (attackEff > 1) {
                    nbmonStrongAgainst.push(receivingType);
                } else if (attackEff < 1) {
                    nbmonWeakAgainst.push(receivingType);
                }
            });
        // if nbmon has only one type
        } else if (firstType !== null && secondType === null) {
            allTypes.forEach((receivingType) => {
                let idx = parseJSON(firstTypeQueryRes).findIndex(type => type["Receiving_Type"] === receivingType);
                let attackEff = parseFloat(parseJSON(firstTypeQueryRes[idx])["Effectiveness"]);

                if (attackEff > 1) {
                    nbmonStrongAgainst.push(receivingType);
                } else if (attackEff < 1) {
                    nbmonWeakAgainst.push(receivingType);
                }
            })
        // if the nbmon is still an egg, both first and second type will be null.
        // this doesn't check if first type doesn't exist and second type exists since that would never happen.
        } else {
            return "Still an egg. Please hatch the NBMon to show its attack effectiveness.";
        }
        return {
            'Strong against': nbmonStrongAgainst,
            'Weak against': nbmonWeakAgainst
        }
    } catch (err) {
        return err;
    }
}

// get nbmon's defense resistance and vulnerability when defending
const getDefenseEffectiveness = async (firstType, secondType) => {
    try {
        if (secondType === "null") {
            secondType = null;
        }
        const TypesDefense = Moralis.Object.extend("Types_Defense");
        const attackQuery = new Moralis.Query(TypesDefense);
        const firstTypeQuery = attackQuery.equalTo("Receiving_Type", firstType);
        const firstTypeQueryRes = await firstTypeQuery.find({ useMasterKey: true });
        const secondTypeQuery = secondType !== null ? attackQuery.equalTo("Receiving_Type", secondType) : null;
        const secondTypeQueryRes = secondTypeQuery !== null 
            ? await secondTypeQuery.find({ useMasterKey: true }) 
            : null;

        let nbmonResistantTo = [];
        let nbmonVulnerableTo = [];

        if (firstType !== null && secondType !== null) {
            allTypes.forEach((attackingType) => {
                let idx = parseJSON(firstTypeQueryRes).findIndex((type) => type["Attacking_Type"] === attackingType);
                let secondIdx = parseJSON(secondTypeQueryRes).findIndex(type => type["Attacking_Type"] === attackingType);
                let firstTypeDefenseEff = parseFloat(parseJSON(firstTypeQueryRes[idx])["Effectiveness"]);
                let secondTypeDefenseEff = parseFloat(parseJSON(secondTypeQueryRes[secondIdx])["Effectiveness"]);
                let defenseEff = firstTypeDefenseEff * secondTypeDefenseEff;
                if (defenseEff < 1) {
                    nbmonResistantTo.push(attackingType);
                } else if (defenseEff > 1) {
                    nbmonVulnerableTo.push(attackingType);
                }
            });
        } else if (firstType !== null && secondType === null) {
            allTypes.forEach((attackingType) => {
                let idx = parseJSON(firstTypeQueryRes).findIndex(type => type["Attacking_Type"] === attackingType);
                let defenseEff = parseFloat(parseJSON(firstTypeQueryRes[idx])["Effectiveness"]);

                if (defenseEff < 1) {
                    nbmonResistantTo.push(attackingType);
                } else if (defenseEff > 1) {
                    nbmonVulnerableTo.push(attackingType);
                }
            })
        } else {
            return "Still an egg. Please hatch the NBMon to show its attack effectiveness.";
        }
        return {
            'Resistant to' : nbmonResistantTo,
            'Vulnerable to': nbmonVulnerableTo
        }
    } catch (err) {
        return err;
    }
}

module.exports = { getAttackEffectiveness, getDefenseEffectiveness };