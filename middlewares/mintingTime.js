require('dotenv').config();
const moment = require("moment");

const whitelistMintingTime = process.env.WHITELIST_MINT_TIME_UNIX;
const publicMintingTime = process.env.PUBLIC_MINT_TIME_UNIX;
const mintingClosedTime = process.env.CLOSE_MINT_TIME_UNIX;

const isWhitelistMintingTime = (_, res, next) => {
    let now = moment().unix();

    if (now <= whitelistMintingTime) {
        let currentTime = moment.unix(now).format("Do MMMM YYYY, hh:mm:ss a");
        let openTime = moment.unix(whitelistMintingTime).format("Do MMMM YYYY hh:mm:ss a");
        res.status(403).json({
            errorMessage: "Whitelist minting isn't open",
            currentTime,
            openTime
        })
    } else {
        next();
    }
}

const isPublicMintingTime = (_, res, next) => {
    let now = moment().unix();

    if (now <= publicMintingTime) {
        let currentTime = moment.unix(now).format("Do MMMM YYYY, hh:mm:ss a");
        let openTime = moment.unix(publicMintingTime).format("Do MMMM YYYY hh:mm:ss a");
        res.status(403).json({
            errorMessage: "Public minting isn't open",
            currentTime,
            openTime
        })
    } else {
        next();
    }
}

// this assumes that the current time has exceeded either whitelist or public minting time and will not check that. 
const mintingTimeNotClosed = (_, res, next) => {
    let now = moment().unix();

    if (now >= mintingClosedTime) {
        let currentTime = moment.unix(now).format("Do MMMM YYYY, hh:mm:ss a");
        let mintingClosedTimeFormatted = moment.unix(mintingClosedTime).format("Do MMMM YYYY, hh:mm:ss a");
        res.status(403).json({
            errorMessage: "Minting event already closed",
            currentTime,
            mintingClosedTimeFormatted
        })
    } else {
        next();
    }

} 

module.exports = { isWhitelistMintingTime, isPublicMintingTime, mintingTimeNotClosed };