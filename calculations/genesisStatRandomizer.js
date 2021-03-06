const Moralis = require('moralis/node');

/**
 * @dev genesisStatRandomizer randomizes the stats for genesis NBMons when hatching.
 * This will be different from the standard NBMon stat randomizer since Genesis NBMons
 * will have a higher chance in getting better stats.
 */

// randomizes the gender when hatching an NBMon
const randomizeGenesisGender = async () => {
    try {
        let genderRand = Math.floor(Math.random() * 2) + 1;
        return genderRand === 1 ? "Male" : "Female";
    } catch (err) {
        return err;
    }
}

// randomizes genesis nbmon's rarity between common, uncommon, rare, epic, legendary and mythical
const randomizeGenesisRarity = async () => {
    try {
        let rarityRand = Math.floor(Math.random() * 1000) + 1;

        switch (true) {
            // 50% chance to get common
            case (rarityRand <= 500):
                return "Common";
            // 25% chance to get uncommon
            case (rarityRand <= 750):
                return "Uncommon";
            // 12.5% chance to get rare
            case (rarityRand <= 875):
                return "Rare";
            // 7% chance to get epic
            case (rarityRand <= 945):
                return "Epic";
            // 4% chance to get legendary
            case (rarityRand <= 985):
                return "Legendary";
            // 1.5% chance to get mythical
            case (rarityRand <= 1000):
                return "Mythical";
        }
    } catch (err) {
        throw new Error(err.stack);
    }
}

// randomizes genus for genesis nbmons. note that only 12 genesis genera are available.
const randomizeGenesisGenus = async () => {
    try {
        let availableGenera = [
            "Lamox",
            "Licorine",
            "Unicorn",
            "Dranexx",
            "Milnas",
            "Todillo",
            "Birvo",
            "Pongu",
            "Darrakan",
            "Kirin",
            "Heree",
            "Spherno"
        ];
    
        let genusRand = Math.floor(Math.random() * availableGenera.length);
    
        return availableGenera[genusRand];
    } catch (err) {
        throw new Error(err.stack);
    }   
}

// there is a 0.5% chance of having a genesis NBMon mutated.
// if mutated, the nbmon will get one extra type move set.
// the nbmon cannot get a mutation type which consists of one of its own.
const randomizeGenesisMutation = async (genusParam) => {
    try {
        // 0.5% chance of mutation for genesis nbmons
        let mutationRand = Math.floor(Math.random() * 1000) + 1;

        if (mutationRand >= 996) {
            const genus = genusParam;
        
            const mutationQuery = new Moralis.Query("Mutations");

            const mutationPipeline = [
                { match: { Genus: genus } },
                { project: { _id: 0, Genus: 1, Mutations: 1 } }
            ];

            const mutationAggRes = await mutationQuery.aggregate(mutationPipeline);

            let mutationTypeRand = Math.floor(Math.random() * mutationAggRes[0]["Mutations"].length);

            return mutationAggRes[0]["Mutations"][mutationTypeRand];
        } else {
            return "Not mutated";
        }
    } catch (err) {
        return err;
    }
}

// randomizing potential for genesis NBMons.
// note that genesis NBMons will have a higher chance for getting better potential.
const randomizeGenesisPotential = async (rarityParam) => {
    try {
        const rarity = rarityParam;
        let potentialArray = [];

        switch (rarity) {
            case "Common":
                for (let i = 0; i <= 6; i++) {
                    // potential for each stat is between 0 - 25
                    let potentialRand = Math.floor(Math.random() * 25);
                    potentialArray[i] = potentialRand;
                }
                break;
            case "Uncommon":
                for (let i = 0; i <= 6; i++) {
                    // potential for each stat is between 10 - 30
                    let potentialRand = Math.floor(Math.random() * 21) + 10;
                    potentialArray[i] = potentialRand;
                }
                break;
            case "Rare":
                for (let i = 0; i <= 6; i++) {
                    // potential for each stat is between 20 - 40
                    let potentialRand = Math.floor(Math.random() * 21) + 20;
                    potentialArray[i] = potentialRand;
                }
                break;
            case "Epic":
                for (let i = 0; i <= 6; i++) {
                    // potential for each stat is between 30 - 50
                    let potentialRand = Math.floor(Math.random() * 21) + 30;
                    potentialArray[i] = potentialRand;
                }
                break;
            case "Legendary":
                for (let i = 0; i <= 6; i++) {
                    // potential for each stat is between 40 - 55
                    let potentialRand = Math.floor(Math.random() * 16) + 40;
                    potentialArray[i] = potentialRand;
                }
                break;
            case "Mythical":
                for (let i = 0; i <= 6; i++) {
                    // potential for each stat is between 50 - 65
                    let potentialRand = Math.floor(Math.random() * 16) + 50;
                    potentialArray[i] = potentialRand;

                    // guaranteed 1 stat which is max potential (65)
                    if (!potentialArray.includes(65)) {
                        let maximizerRand = Math.floor(Math.random() * 7);
                        potentialArray[maximizerRand] = 65;
                    }
                }
                break;
        }
        return potentialArray;
    } catch (err) {
        return err;
    }
}

const randomizeGenesisPassives = async () => {
    try {
        const passiveQuery = await new Moralis.Query("Passives");

        const passivePipeline = [
            { project: { _id: 0, Name: 1 } }
        ];

        const passiveAggRes = await passiveQuery.aggregate(passivePipeline);

        let passiveRand = Math.floor(Math.random() * passiveAggRes.length);
        let passiveRandTwo = Math.floor(Math.random() * passiveAggRes.length);

        do {
            passiveRandTwo = Math.floor(Math.random() * passiveAggRes.length);
        } while (passiveRandTwo === passiveRand);

        return [passiveAggRes[passiveRand]["Name"], passiveAggRes[passiveRandTwo]["Name"]];
    } catch (err) {
        return err;
    }
}

module.exports = {
    randomizeGenesisGender,
    randomizeGenesisRarity,
    randomizeGenesisMutation,
    randomizeGenesisGenus,
    randomizeGenesisPotential,
    randomizeGenesisPassives
};