const publicMintTime = async function (_, res, next) {
	const openTime = parseInt(process.env.PUBLIC_MINT_OPENS_TIMESTAMP);
	const closeTime = parseInt(process.envPUBLIC_MINT_CLOSES_TIMESTAMP);
	const currentTime = Math.round(Date.now() / 1000);

	//Between opening time and closing time ...
	if (currentTime >= openTime && currentTime <= closeTime) {
		next(); // next() here means it will go to the actual route
	} else {
		//Otherwise, forbidden to access route.
		res.status(403).json({
			errorMessage: "Public minting isn't open",
			currentTime,
			openTime,
		});
	}
};

module.exports = { publicMintTime };
