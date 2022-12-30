const CONSTANTS = {
	BASE_URL: "https://tellonym.me/",
	REGISTER_FIRST_URL: "register/username",
	REGISTER_SECOND_URL: "register/email",
	EMAIL_INPUT_NAME: "email",
	SHARE_LINK_XPATH: "/html/body/div[1]/div/div/div[5]/div/div/div[1]/div[2]/div[2]",
	API_BASE_URL: "https://api.tellonym.me/",
	API_SEND_URL: "tells/new",
	API_SEARCH_URL: "search/users",
	USER_AGENT:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
	UPDATE_URL: "https://raw.githubusercontent.com/FedeIlLeone/Tnym-js/master/package.json",
	BROWSER_WEBDRIVERS: {
		chrome: "chromedriver",
		firefox: "geckodriver"
	},
	PROXY_REGEX:
		/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b:\d{2,5}/,
	RETRIES: 25,
	TIMEOUT: 10000
};

module.exports = CONSTANTS;
