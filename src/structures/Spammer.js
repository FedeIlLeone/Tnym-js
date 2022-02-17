const fetch = require("node-fetch");
const { ipcRenderer } = require("electron");
const WebManager = require("./WebManager");
const constants = require("../util/constants");

class Spammer {
	constructor(user, browser) {
		this.user = user;
		this.web = new WebManager(browser);
		this.token = "";
	}

	async init() {
		let token = await this.web.getLatestToken();

		if (token) {
			this.token = token;
		} else {
			try {
				this.token = await this.web.registerAccount();
				// eslint-disable-next-line no-empty
			} catch {}
			this.close();
		}

		return this.token;
	}

	async send(message, userId, proxy) {
		if (proxy) ipcRenderer.send("set-proxy", proxy);
		const valid = await this.sendRequest(message, userId);
		return valid;
	}

	async sendRequest(message, userId) {
		const data = {
			headers: {
				authorization: `Bearer ${this.token}`,
				"content-type": "application/json;charset=utf-8"
			},
			body: `{"isSenderRevealed":false,"tell":"${message}","userId":${userId},"limit":25}`,
			method: "POST"
		};

		/*
			Gets null response if request is successful
		*/
		let response = null;
		try {
			response = await fetch(constants.API_BASE_URL + constants.API_SEND_URL, data).then((res) => res.json());
		} catch {
			if (response === null) return [true];
		}

		return [false, response.err.code];
	}

	async close() {
		try {
			if (this.web.driver) await this.web.driver.quit();
			// eslint-disable-next-line no-empty
		} catch {}

		this.web.driver = null;
	}
}

module.exports = Spammer;
