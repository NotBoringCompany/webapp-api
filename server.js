require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const genesisNBMon = require('./routes/genesisNBMon');
const genesisNBMonMinting = require('./routes/genesisNBMonMinting');

app.use('/genesisNBMon', genesisNBMon);
app.use('/genesisNBMonMinting', genesisNBMonMinting);
app.listen(port, () => console.log(`listening from port ${port}`));