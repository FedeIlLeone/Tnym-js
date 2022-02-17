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
	},

	shuffle(array) {
		let currentIndex = array.length;
		let randomIndex = null;

		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}
};
