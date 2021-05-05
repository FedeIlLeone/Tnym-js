const WebManager = require("./WebManager");
const base = "https://tellonym.me/";

class SpammerAPI {
	constructor(user, timeout) {
		this.popup = false;
		this.user = user;
		this.timeout = timeout;
		this.web = new WebManager(base + this.user, this.timeout);
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

module.exports = SpammerAPI;