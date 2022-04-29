const Moralis = require("moralis/node");
const crypto = require("crypto");

const TWO_HOURS_IN_MS = 7200 * 1000;

const sendPasswordResetRequest = async (email) => {
	const returnMsg = {
		status: "ok",
		message: "Reset password email has been sent",
	};
	try {
		const user = await getUser(email);

		// still saves requests with no actual user connected to that email

		if (user) {
			await createPasswordResetRequest(email);
			//sends email
			return user.email;
		} else {
			return returnMsg;
		}
	} catch (err) {
		throw new Error(err);
	}
};

/**
 * @dev Resets the user's password
 **/

const resetPassword = async (tokenId, newPassword, confirmNewPassword) => {
	try {
		if (newPassword !== confirmNewPassword)
			throw new Error("Passwords are not the same");

		const { email } = await checkIfTokenValid(tokenId);
		if (email) {
			const users = Moralis.Object.extend("_User");

			const userQuery = new Moralis.Query(users);
			userQuery.equalTo("email", email.toLowerCase());

			const userQueryResult = await userQuery.first({
				useMasterKey: true,
			});

			if (userQueryResult) {
				userQueryResult.set("password", newPassword);
			}

			await userQueryResult.save(null, { useMasterKey: true });
			await deleteRequest(tokenId);
			return { status: "ok", message: "Password has been reset successfully" };
		} else {
			throw new Error("User does not exist");
		}
	} catch (err) {
		throw err.message;
	}
};

/**
 * @dev Checks if token is valid. Valid means:
 * 1. Has a length of more than 150 chars, typically 300.
 * 2. Exists in DB.
 * 3. Hasn't expired yet (less than 2 hours old).
 
 * Returns `valid` (boolean), and (user's) `email` (string) if `valid` is `true`.
 */
const checkIfTokenValid = async (tokenId) => {
	try {
		if (tokenId.length < 150) return { valid: false, email: null };

		const passwordResetRequests = Moralis.Object.extend(
			"ForgotPasswordRequests"
		);
		const passwordResetRequestQuery = new Moralis.Query(passwordResetRequests);
		passwordResetRequestQuery.equalTo("tokenId", tokenId);
		const queryResult = await passwordResetRequestQuery.first({
			useMasterKey: true,
		});

		if (queryResult) {
			const jsonResult = JSON.parse(JSON.stringify(queryResult));
			const notExpired = jsonResult.validUntil > Date.now();

			return { valid: notExpired, email: notExpired ? jsonResult.email : null };
		}

		return { valid: false, email: null };
	} catch (err) {
		throw new Error(err.stack);
	}
};

/**
 * @dev Creates a new record/row in the ForgotPasswordRequests class.
 * This record contains all the needed data for resetting a user's password.
 */
const createPasswordResetRequest = async (email) => {
	const passwordResetRequests = Moralis.Object.extend("ForgotPasswordRequests");
	const newPasswordResetRequest = new passwordResetRequests();
	const tokenId = crypto.randomBytes(150).toString("hex");
	newPasswordResetRequest.set("email", email);
	newPasswordResetRequest.set("tokenId", tokenId);
	newPasswordResetRequest.set("validUntil", Date.now() + TWO_HOURS_IN_MS); // valid until two more hours

	await newPasswordResetRequest
		.save(null, { useMasterKey: true })
		.catch((err) => err);
};

const getUser = async (email) => {
	const users = Moralis.Object.extend("_User");

	const userQuery = new Moralis.Query(users);
	userQuery.equalTo("email", email.toLowerCase());
	const queryResult = await userQuery.first({ useMasterKey: true });
	if (queryResult) return JSON.parse(JSON.stringify(queryResult));

	return null;
};

/**
 * @dev Deletes a record/row in the ForgotPasswordRequests class by its tokenId.
 */
const deleteRequest = async (tokenId) => {
	const passwordResetRequests = Moralis.Object.extend("ForgotPasswordRequests");

	const passwordResetRequestQuery = new Moralis.Query(passwordResetRequests);
	passwordResetRequestQuery.equalTo("tokenId", tokenId);

	const queryResult = await passwordResetRequestQuery.first({
		useMasterKey: true,
	});

	if (queryResult) {
		await queryResult.destory(null, { useMasterKey: true });
	}
};

module.exports = { sendPasswordResetRequest, resetPassword, checkIfTokenValid };
