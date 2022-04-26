const express = require("express");
const router = express.Router();

const { getAttackEffectiveness, getDefenseEffectiveness, testQuery } = require("../logic/typeEffectivenessLogic");

router.get("/getAttackEffectiveness/:firstType/:secondType/:isGenesis", async (req, res) => {
    let firstType = req.params.firstType;
    let secondType = req.params.secondType;
    let isGenesis = req.params.isGenesis;

    let effectiveness = await getAttackEffectiveness(firstType, secondType, isGenesis).catch((err) => res.json(err.message));
    res.json(effectiveness);
});

router.get("/getDefenseEffectiveness/:firstType/:secondType/:isGenesis", async (req, res) => {
    let firstType = req.params.firstType;
    let secondType = req.params.secondType;
    let isGenesis = req.params.isGenesis;

    let effectiveness = await getDefenseEffectiveness(firstType, secondType, isGenesis).catch((err) => res.json(err.message));
    res.json(effectiveness);
});

router.get("/testQuery", async (req, res) =>{
    let test = await testQuery().catch((err) => res.json(err));
    res.json(test);
})

module.exports = router;