const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");
const edge = require("selenium-webdriver/edge");

class Driver {
	constructor(browser, headless) {
		this.browser = browser;
		this.headless = headless;
	}

	getDriver() {
		let driver = new Builder().forBrowser(this.browser);

		if (this.browser === "chrome") {
			driver.setChromeOptions(this.headless ? new chrome.Options().headless() : new chrome.Options());
		} else if (this.browser === "firefox") {
			driver.setFirefoxOptions(this.headless ? new firefox.Options().headless() : new firefox.Options());
		} else if (this.browser === "edge") {
			driver.setEdgeOptions(this.headless ? new edge.Options().headless() : new edge.Options());
		}

		return driver.build();
	}
}

module.exports = Driver;