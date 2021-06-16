const { By, until, Key } = require("selenium-webdriver");
const Driver = require("./Driver");
const Constants = require("../util/Constants");

class WebManager {
	constructor(url, browser, headless) {
		this.url = url;
		this.driver = new Driver(browser, headless).getDriver();
	}

	async loadPage() {
		await this.driver.get(this.url);
	}

	async acceptPopup() {
		await this.driver.wait(until.elementLocated(By.xpath(Constants.POPUP_XPATH)));

		let popupButton = await this.driver.findElement(By.xpath(Constants.POPUP_XPATH));
		popupButton.click();
	}

	async sendMessage(message) {
		await this.driver.wait(until.elementLocated(By.name(Constants.TEXTBOX_NAME), 10000));

		let textBox = await this.driver.findElement(By.name(Constants.TEXTBOX_NAME));
		await textBox.clear();
		await textBox.sendKeys(message);
		await this.sendKeys(textBox, message);
		await textBox.sendKeys(Key.CONTROL + Key.ENTER);
	}

	async validateMessage() {
		let title = await this.driver.wait(until.titleIs(Constants.SUCCESS_TITLE), 10000);
		return title;
	}

	async sendKeys(element, text) {
		const script = `
			var elm = arguments[0], txt = arguments[1];
			elm.value += txt;
			elm.dispatchEvent(new Event("change"));
		`;
		await this.driver.executeScript(script, element, text);
	}
}

module.exports = WebManager;