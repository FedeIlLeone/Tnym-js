const Constants = require("../util/Constants");

module.exports = {
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},

	checkBrowserCompatibility(browser) {
		let bsr = browser.toLowerCase();

		return Constants.BROWSER_COMPATIBILITY.includes(bsr);
	}
};