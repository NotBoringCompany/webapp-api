const genesisStatRandomizer = require("../calculations/genesisStatRandomizer");
const { getGenesisNBMonTypes } = require("./genesisNBMonLogic");

// hatches the nbmon from an egg and gives it its respective stats
const randomizeHatchingStats = async () => {
    try {
        const gender = (await genesisStatRandomizer.randomizeGenesisGender()).toString();
        const rarity = (await genesisStatRandomizer.randomizeGenesisRarity()).toString();
        const genus = (await genesisStatRandomizer.randomizeGenesisGenus()).toString();
        const mutation = (await genesisStatRandomizer.randomizeGenesisMutation(genus)).toString();
        const species = "Origin";
        const fertility = "3000";
        const nbmonStats = [gender, rarity, genus, mutation, species, fertility];
        const types = await getGenesisNBMonTypes(genus);
        const potential = await genesisStatRandomizer.randomizeGenesisPotential(rarity);
        const passives = await genesisStatRandomizer.randomizeGenesisPassives();

        return {
            nbmonStats: nbmonStats,
            types: types,
            potential: potential,
            passives: passives
        }
    } catch (err) {
        return err;
    }
}

module.exports = {
    randomizeHatchingStats
};