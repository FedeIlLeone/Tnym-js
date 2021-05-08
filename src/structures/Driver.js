const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");
const edge = require("selenium-webdriver/edge");

class Driver {
	constructor(browser) {
		this.browser = browser;
	}

	getDriver() {
		let driver = new Builder().forBrowser(this.browser);

		if (this.browser === "chrome") {
			driver.setChromeOptions(new chrome.Options().headless());
		} else if (this.browser === "firefox") {
			driver.setFirefoxOptions(new firefox.Options().headless());
		} else if (this.browser === "edge") {
			driver.setEdgeOptions(new edge.Options().headless());
		}

		return driver.build();
	}
}

module.exports = Driver;