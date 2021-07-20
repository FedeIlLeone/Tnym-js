const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");

class Driver {
	constructor(browser) {
		this.browser = browser;
	}

	getDriver() {
		let driver = new Builder().forBrowser(this.browser);

		if (this.browser === "chrome") {
			driver.setChromeOptions(new chrome.Options());
		} else if (this.browser === "firefox") {
			driver.setFirefoxOptions(new firefox.Options());
		}

		return driver.build();
	}
}

module.exports = Driver;