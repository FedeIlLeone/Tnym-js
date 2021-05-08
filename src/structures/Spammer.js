const WebManager = require("./WebManager");
const Constants = require("../util/Constants");

class Spammer {
	constructor(user, browser) {
		this.popup = false;
		this.user = user;
		this.browser = browser;
		this.web = new WebManager(Constants.BASE_URL + this.user, this.browser);
	}

	async send(message) {
		await this.web.loadPage();

		if (!this.popup) {
			await this.web.acceptPopup();
			this.popup = true;
		}

		await this.web.sendMessage(message);

		try {
			let valid = await this.web.validateMessage();
			return valid;
		} catch {
			return false;
		}
	}

	async close() {
		await this.web.driver.quit();
	}
}

module.exports = Spammer;