const constants = require("./constants");

module.exports = {
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},

	genString(length) {
		let result = "";
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const charactersLength = characters.length;

		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	},

	getDriverFileName(browser) {
		return constants.BROWSER_WEBDRIVERS[browser];
	},

	checkWebDriverExistence(browser) {
		const driverFileName = this.getDriverFileName(browser);
		return process.env.path.includes(driverFileName);
	}
};