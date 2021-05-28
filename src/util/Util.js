const { execSync } = require("child_process");
const Constants = require("../util/Constants");

module.exports = {
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},

	checkWebDriverExistence(browser) {
		try {
			execSync(`${Constants.BROWSER_WEBDRIVERS[browser]} --version`, {
				stdio: "inherit"
			});
			return true;
		} catch {
			return false;
		}
	}
};