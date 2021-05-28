const WebManager = require("./WebManager");
const Constants = require("../util/Constants");

class Spammer {
	constructor(user, browser, headless) {
		this.popup = false;
		this.user = user;
		this.web = new WebManager(Constants.BASE_URL + this.user, browser, headless);
	}

	async load() {
		try {
			await this.web.loadPage();
			return true;
		} catch {
			return false;
		}
	}

	async send(message) {
		await this.load();

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
		try {
			await this.web.driver.quit();
			// eslint-disable-next-line no-empty
		} catch {}

		this.web.driver = null;
	}
}

module.exports = Spammer;