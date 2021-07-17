const CONSTANTS = {
	BASE_URL: "https://tellonym.me/",
	REGISTER_FIRST_URL: "register/username",
	REGISTER_SECOND_URL: "register/email",
	EMAIL_INPUT_NAME: "email",
	SHARE_LINK_XPATH: "/html/body/div[1]/div/div/div[5]/div/div/div[1]/div[2]/div[2]",
	
	API_BASE_URL: "https://api.tellonym.me/",
	API_SEND_URL: "tells/new",
	API_SEARCH_URL: "search/users",

	UPDATE_URL: "https://raw.githubusercontent.com/FedeIlLeone/Tnym-js/master/package.json",
	BROWSER_WEBDRIVERS: {
		chrome: "chromedriver",
		firefox: "geckodriver",
		edge: "msedgedriver"
	},

	RETRIES: 25,
	TIMEOUT: 10000
};

module.exports = CONSTANTS;