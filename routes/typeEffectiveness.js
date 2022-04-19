const express = require("express");
const router = express.Router();

const { getAttackEffectiveness, getDefenseEffectiveness } = require("../logic/typeEffectivenessLogic");

router.get("/getAttackEffectiveness/:id/:isGenesis", async (req, res) => {
    let id = req.params.id;
    let isGenesis = req.params.isGenesis;

    let effectiveness = await getAttackEffectiveness(id, isGenesis).catch((err) => res.json(err.message));
    res.json(effectiveness);
});

router.get("/getDefenseEffectiveness/:id/:isGenesis", async (req, res) => {
    let id = req.params.id;
    let isGenesis = req.params.isGenesis;

    let effectiveness = await getDefenseEffectiveness(id, isGenesis).catch((err) => res.json(err.message));
    res.json(effectiveness);
});

module.exports = router;