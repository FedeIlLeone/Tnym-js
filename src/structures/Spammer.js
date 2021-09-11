const fetch = require("node-fetch");
const WebManager = require("./WebManager");
const constants = require("../util/constants");

class Spammer {
	constructor(user, browser, useLatestToken) {
		this.user = user;
		this.web = new WebManager(browser);
		this.token = "";
		this.useLatestToken = useLatestToken;
	}

	async init() {
		if (this.useLatestToken) {
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
		} else {
			try {
				this.token = await this.web.registerAccount();
				// eslint-disable-next-line no-empty
			} catch {}
			this.close();
		}

		return this.token;
	}

	async send(message, userId) {
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
			if (response === null) return true;
		}

		return false;
	}

	async getUserId(username) {
		let userId = null;

		const args = {
			searchString: username,
			limit: 50
		};

		const url = new URL(constants.API_BASE_URL + constants.API_SEARCH_URL);
		url.search = new URLSearchParams(args).toString();

		let response = null;
		try {
			response = await fetch(url).then((res) => res.json());
		} catch {
			return userId;
		}

		if (response.results) {
			response.results.forEach((search) => {
				if (search.username.toLowerCase() === username.toLowerCase()) userId = search.id;
			});
		}

		return userId;
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