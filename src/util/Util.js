const Constants = require("../util/Constants");

module.exports = {
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},

	getDriverFileName(browser) {
		return Constants.BROWSER_WEBDRIVERS[browser];
	},

	checkWebDriverExistence(browser) {
		let driverFileName = this.getDriverFileName(browser);

		return process.env.path.includes(driverFileName);
	}
};