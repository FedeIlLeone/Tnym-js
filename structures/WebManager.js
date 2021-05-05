const chrome = require("selenium-webdriver/chrome");
const { Builder, By, Key, until } = require("selenium-webdriver");

class WebManager {
	constructor(url, timeout) {
		this.url = url;
		this.timeout = timeout;
		this.driver = new Builder().forBrowser("chrome").setChromeOptions(new chrome.Options()).build();
	}

	async loadPage() {
		await this.driver.get(this.url);
	}

	async acceptPopup() {
		await this.driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/div/div/div[2]/div/button[2]")));

		let popupButton = await this.driver.findElement(By.xpath("/html/body/div[1]/div/div/div/div[2]/div/button[2]"));
		popupButton.click();
	}

	async sendMessage(message) {
		await this.driver.wait(until.elementLocated(By.name("tell"), 10000));

		let textBox = await this.driver.findElement(By.name("tell"));
		await textBox.clear();
		await textBox.sendKeys(message);
		await this.sendKeys(textBox, message);
		await textBox.sendKeys(Key.CONTROL + Key.ENTER);
	}

	async validateMessage() {
		let title = await this.driver.wait(until.titleIs("Tellonym"), 10000);
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