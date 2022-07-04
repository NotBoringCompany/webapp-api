const Moralis = require("moralis/node");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const TWO_HOURS_IN_MS = 7200 * 1000;

const CLIENT_ID = process.env.GOOGLE_APIS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_APIS_CLIENT_SECRET;
const REDIR_URL = process.env.GOOGLE_APIS_REDIR_URL;
const REFRESH_TOKEN = process.env.GOOGLE_APIS_REFRESH_TOKEN;
const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;
const AUTHOIRSED_EMAIL = process.env.GOOGLE_APIS_AUTHORISED_EMAIL;

const oAuth2Client = new google.auth.OAuth2(
	CLIENT_ID,
	CLIENT_SECRET,
	REDIR_URL
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendPasswordResetRequest = async (email) => {
	const returnMsg = {
		status: "ok",
		message: "Reset password email has been sent",
	};
	try {
		const user = await getUser(email);
		if (user) {
			const tokenId = await createPasswordResetRequest(email);
			await sendEmail(email, tokenId);
			return returnMsg;
		} else {
			return returnMsg;
		}
	} catch (err) {
		throw new Error(err);
	}
};

const sendEmail = async (emailAddress, tokenId) => {
	try {
		const accessToken = await oAuth2Client.getAccessToken();

		const transport = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAUTH2",
				user: AUTHOIRSED_EMAIL,
				clientId: CLIENT_ID,
				clientSecret: CLIENT_SECRET,
				refresh_token: REFRESH_TOKEN,
				accessToken: accessToken.token,
			},
		});

		const mailOptions = {
			from: `Realm Hunter <${AUTHOIRSED_EMAIL}>`,
			to: emailAddress,
			subject: "Realm Hunter: Reset your password",
			html: `Hey there! <br/> <br/> Someone has just requested a password change for an account with this email address. Please ignore this message if you don't want to change your password. <br/><br/> <a target='_blank' rel='noopener noreferrer' href='${FRONTEND_DOMAIN}/connect?rtk=${tokenId}'>Click this link to reset your password</a>. This link will be valid for 2 hours. <br/><br/> Sincerly, your Realm Hunter team. 😊`,
		};

		const result = transport.sendMail(mailOptions);
		return result;
	} catch (error) {
		throw err.message;
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

	return tokenId;
};

const getUser = async (email) => {
	const users = Moralis.Object.extend("_User");

	const userQuery = new Moralis.Query(users);
	userQuery.equalTo("email", email.toLowerCase());
	const queryResult = await userQuery.first({ useMasterKey: true });
	if (queryResult) return JSON.parse(JSON.stringify(queryResult));

	return null;
};

const userLogin = async (login, password) => {
    try {

        const user = await Moralis.User.logIn(login, password);

        return { status: "ok", message: user.get("sessionToken") }


    } catch (err) {
        throw err.message;
    }
};

/**
 * @dev Deletes a record/row in the ForgotPasswordRequests class by its tokenId.
 */
const deleteRequest = async (tokenId) => {
	const passwordResetRequests = Moralis.Object.extend("ForgotPasswordRequests");

	const passwordResetRequestQuery = new Moralis.Query(passwordResetRequests);
	passwordResetRequestQuery.equalTo("tokenId", tokenId);

	const object = await passwordResetRequestQuery.first({
		useMasterKey: true,
	});

	if (object) object.destroy({ useMasterKey: true });
};

module.exports = { sendPasswordResetRequest, resetPassword, checkIfTokenValid, userLogin };
