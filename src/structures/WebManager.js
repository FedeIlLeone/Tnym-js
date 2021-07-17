const { By, until, Key } = require("selenium-webdriver");
const settings = require("electron-settings");
const Driver = require("./Driver");
const Constants = require("../util/Constants");
const Util = require("../util/Util");

class WebManager {
	constructor(browser) {
		this.browser = browser;
		this.driver = null;
	}

	async registerAccount() {
		try {
			this.driver = new Driver(this.browser).getDriver();
			await this.driver.get(Constants.BASE_URL + Constants.REGISTER_FIRST_URL);
		} catch {
			return null;
		}

		let randomString = Util.genString(20);

		/*
			Setting `noniabvendorconsent` and `_cmpRepromptHash` to an equal value, bypasses privacy agreement
			and `reduxPersist:user` is for a faster account registration, which bypasses all inputs
		*/
		await this.driver.executeScript(`
			window.localStorage.setItem("noniabvendorconsent", ".");
			window.localStorage.setItem("_cmpRepromptHash", ".");
			window.localStorage.setItem("reduxPersist:user", "{\\"email\\":\\"${randomString}@gmail.com\\",\\"password\\":\\"${randomString}\\",\\"username\\":\\"${randomString}\\"}");
		`);

		await this.driver.get(Constants.BASE_URL + Constants.REGISTER_SECOND_URL);

		let emailInput = await this.driver.wait(until.elementLocated(By.name(Constants.EMAIL_INPUT_NAME), Constants.TIMEOUT));
		await emailInput.sendKeys(Key.CONTROL + Key.ENTER);

		await this.driver.wait(until.elementLocated(By.xpath(Constants.SHARE_LINK_XPATH)));

		let accessToken = await this.gatherNewToken();

		return accessToken;
	}

	async gatherNewToken() {
		/*
			Gets first the profile Id from `reduxPersist:profile` and then get the accessToken from `reduxPersist:__app__`
		*/
		let token = "";
		let [appData, profileData] = await this.driver.executeScript(`
			return [window.localStorage.getItem("reduxPersist:__app__"), window.localStorage.getItem("reduxPersist:profile")]
		`);

		if (appData) appData = JSON.parse(appData);
		if (profileData) profileData = JSON.parse(profileData);

		if (appData.accounts.length !== 0) {
			if (appData.accounts[profileData.profile.id]) {
				token = appData.accounts[profileData.profile.id].accessToken;
			}
		}

		await settings.set("token", token);

		return token;
	}

	async getLatestToken() {
		let token = await settings.get("token");
		return token;
	}
}

module.exports = WebManager;