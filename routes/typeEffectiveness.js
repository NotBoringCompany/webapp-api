const express = require("express");
const router = express.Router();

const { getAttackEffectiveness, getDefenseEffectiveness } = require("../logic/typeEffectivenessLogic");

router.get("/getAttackEffectiveness/:firstType/:secondType", async (req, res) => {
    let firstType = req.params.firstType;
    let secondType = req.params.secondType;

    let effectiveness = await getAttackEffectiveness(firstType, secondType).catch((err) => res.json(err.message));
    res.json(effectiveness);
});

router.get("/getDefenseEffectiveness/:firstType/:secondType", async (req, res) => {
    let firstType = req.params.firstType;
    let secondType = req.params.secondType;

    let effectiveness = await getDefenseEffectiveness(firstType, secondType).catch((err) => res.json(err.message));
    res.json(effectiveness);
});

module.exports = router;