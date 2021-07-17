const Constants = require("../util/Constants");

module.exports = {
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},

	genString(length) {
		let result = "";
		let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let charactersLength = characters.length;

		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	},

	getDriverFileName(browser) {
		return Constants.BROWSER_WEBDRIVERS[browser];
	},

	checkWebDriverExistence(browser) {
		let driverFileName = this.getDriverFileName(browser);

		return process.env.path.includes(driverFileName);
	}
};