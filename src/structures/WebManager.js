const Store = require("electron-store");
const { By, until, Key } = require("selenium-webdriver");
const Driver = require("./Driver");
const constants = require("../util/constants");
const utils = require("../util/utils");

const store = new Store();

class WebManager {
	constructor(browser) {
		this.browser = browser;
		this.driver = null;
	}

	async registerAccount() {
		try {
			this.driver = new Driver(this.browser).getDriver();
			await this.driver.get(constants.BASE_URL + constants.REGISTER_FIRST_URL);
		} catch {
			return null;
		}

		const randomString = utils.genString(20);

		/*
			Setting `noniabvendorconsent` and `_cmpRepromptHash` to an equal value, bypasses privacy agreement
			and `reduxPersist:user` is for a faster account registration, which bypasses all inputs

			! got patched, wait for a new release
		*/
		await this.driver.executeScript(`
			window.localStorage.setItem("noniabvendorconsent", ".");
			window.localStorage.setItem("_cmpRepromptHash", ".");
			window.localStorage.setItem("reduxPersist:user", "{\\"email\\":\\"${randomString}@gmail.com\\",\\"password\\":\\"${randomString}\\",\\"username\\":\\"${randomString}\\"}");
		`);

		await this.driver.get(constants.BASE_URL + constants.REGISTER_SECOND_URL);

		const emailInput = await this.driver.wait(
			until.elementLocated(By.name(constants.EMAIL_INPUT_NAME), constants.TIMEOUT)
		);
		await emailInput.sendKeys(Key.CONTROL + Key.ENTER);

		await this.driver.wait(until.elementLocated(By.xpath(constants.SHARE_LINK_XPATH)));

		const accessToken = await this.gatherNewToken();
		return accessToken;
	}

	async gatherNewToken() {
		// Get first the profile Id from `reduxPersist:profile` and then get the accessToken from `reduxPersist:__app__`
		let token = "";
		let [appData, profileData] = await this.driver.executeScript(`
			return [window.localStorage.getItem("reduxPersist:__app__"), window.localStorage.getItem("reduxPersist:profile")]
		`);

		if (appData) appData = JSON.parse(appData);
		if (profileData) profileData = JSON.parse(profileData);

		if (appData.accounts.length !== 0) {
			if (appData.accounts[profileData.profile.id]) token = appData.accounts[profileData.profile.id].accessToken;
		}

		store.set("token", token);

		return token;
	}

	async getLatestToken() {
		const token = store.get("token");
		return token;
	}
}

module.exports = WebManager;
