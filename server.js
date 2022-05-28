require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const Moralis = require("moralis/node");

const serverUrl = process.env.MORALIS_SERVERURL;
const appId = process.env.MORALIS_APPID;
const masterKey = process.env.MORALIS_MASTERKEY;

const port = process.env.PORT;

app.use(cors());
app.use(express.json());
const account = require("./routes/account");
const genesisNBMon = require("./routes/genesisNBMon");
const genesisNBMonMinting = require("./routes/genesisNBMonMinting");
const activities = require("./routes/activities");
const typeEffectiveness = require("./routes/typeEffectiveness");
const genesisNBMonHatching = require("./routes/genesisNBMonHatching");
const marketplace = require("./routes/marketplace");

app.use("/account", account);
app.use("/genesisNBMon", genesisNBMon);
app.use("/genesisNBMonMinting", genesisNBMonMinting);
app.use("/activities", activities);
app.use("/typeEffectiveness", typeEffectiveness);
app.use("/genesisNBMonHatching", genesisNBMonHatching);
app.use("/marketplace", marketplace);

app.listen(port, async () => {
	console.log(`listening from port ${port}`);

	//Starts moralis globally with masterKey
	await Moralis.start({ serverUrl, appId, masterKey });
});
