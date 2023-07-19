/* eslint-disable no-await-in-loop */
const Store = require("electron-store");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { fetch } = require("undici");
const Spammer = require("../structures/Spammer");
const constants = require("../util/constants");
const utils = require("../util/utils");

const loadingDimmer = document.getElementById("loading-dimmer");
const updateNag = document.getElementById("update-nag");
const updateText = document.getElementById("update-text");
const closeButton = document.getElementById("close-button");
const userInput = document.getElementById("user-input");
const fileInput = document.getElementById("file-input");
const messagesOptionsButton = document.getElementById("messagesoptions-button");
const messagesModal = document.getElementById("messages-modal");
const repeatsInput = document.getElementById("repeats-input");
const randomizeFileCheckbox = document.getElementById("randomizefile-checkbox");
const browserDropdown = document.getElementById("browser-dropdown");
const webdriverOptionsButton = document.getElementById("webdriveroptions-button");
const webdriverModal = document.getElementById("webdriver-modal");
const proxiesFileInput = document.getElementById("proxiesfile-input");
const startButton = document.getElementById("start-button");
const startIcon = document.getElementById("start-icon");
const logsButton = document.getElementById("logs-button");
const logsModal = document.getElementById("logs-modal");
const logsTextarea = document.getElementById("logs-textarea");
const logsClearButton = document.getElementById("logs-clear-button");
const versionText = document.getElementById("version-text");

const store = new Store();
const userCache = new Map();

let started = false;
let spammer = null;

function showToast(title, type, message) {
	$("body").toast({
		title: title,
		message: message,
		class: "grey",
		classProgress: type === "warning" ? "yellow" : "blue",
		showProgress: "bottom",
		displayTime: "auto"
	});
}

function loading(state, message) {
	if (message) loadingDimmer.firstElementChild.innerHTML = message;
	$(loadingDimmer)
		.removeClass(state ? "" : "active")
		.addClass(state ? "active" : "");
}

function startStop(state) {
	startButton.firstElementChild.innerHTML = state ? "Stop" : "Start";
	$(startIcon)
		.removeClass(state ? "play green" : "stop red")
		.addClass(state ? "stop red" : "play green");
}

function conclude() {
	started = false;
	spammer.close();
	startStop(false);
	loading(false);
}

function driverSetPath(browser) {
	let osArch = os.arch();
	const driverFileName = utils.getDriverFileName(browser);

	if (osArch === "arm" || osArch === "ia32") osArch = "x32";
	if (osArch === "arm64") osArch = "x64";

	const driverPath = path.join(process.resourcesPath, "drivers", driverFileName, osArch);
	process.env.path += `;${driverPath}`;
}

async function getUser(username) {
	let user = null;

	const args = { searchString: username, limit: 50 };

	const url = new URL(constants.API_BASE_URL + constants.API_SEARCH_URL);
	url.search = new URLSearchParams(args).toString();

	let response = null;
	try {
		const data = {
			headers: {
				"user-agent": constants.USER_AGENT
			}
		};

		response = await fetch(url, data).then((res) => res.json());
	} catch {
		return user;
	}

	if (response.results) {
		for (const search of response.results) {
			if (search.username.toLowerCase() === username.toLowerCase()) {
				user = { id: search.id, username: search.username };
				userInput.value = search.username;
			}
		}
	}

	return user;
}

function log(text) {
	logsTextarea.value += `\r\n${text}`;
	logsTextarea.scrollTop = logsTextarea.scrollHeight;
}

async function checkUpdates() {
	let response = null;
	try {
		response = await fetch(constants.UPDATE_URL).then((res) => res.json());
	} catch {
		return [null];
	}

	const currentVersion = _VERSION_.replaceAll(".", "");
	const latestVersion = response.version.replaceAll(".", "");
	if (currentVersion >= latestVersion) return [true];

	return [false, response.version];
}

closeButton.addEventListener("click", () => {
	if (spammer) spammer.close();
	window.close();
});

if (store.has("user")) {
	const userSaved = store.get("user").toLowerCase();
	if (userSaved) {
		$(userInput).prop("readonly", true);
		getUser(userSaved).then((user) => {
			userCache.set(userSaved, user);
			if (user) {
				userInput.value = user.username;
				$(startButton).removeClass("disabled");
			} else {
				store.delete("user");
			}
			$(userInput).prop("readonly", false);
		});
	}
}
$(userInput).on("focusout", async () => {
	const userInserted = userInput.value.toLowerCase();
	if (userInserted === "") return;

	$(userInput).parent().addClass("loading");

	const user = userCache.get(userInserted) || (await getUser(userInserted));
	userCache.set(userInserted, user);
	userInput.value = user?.username || "";

	$(userInput).parent().removeClass("loading");
	$(startButton).removeClass("disabled");

	if (user) return;

	$(startButton).addClass("disabled");
	showToast("Warning", "warning", `${userInserted} doesn't exist on Tellonym`);
});

messagesOptionsButton.addEventListener("click", () => $(messagesModal).modal("show"));

repeatsInput.addEventListener("input", () => {
	const number = repeatsInput.value;
	if (number) {
		repeatsInput.value = Math.floor(number);
		if (number < 1 || number > 100) repeatsInput.value = Math.min(Math.max(Number.parseInt(number), 1), 100);
	} else {
		repeatsInput.value = "";
	}
});

$(".activating.element").popup();

$(browserDropdown).dropdown();

webdriverOptionsButton.addEventListener("click", () => $(webdriverModal).modal("show"));

startButton.addEventListener("click", async () => {
	if (started) {
		started = false;
		loading(true, "Completing last task...");
		return;
	}

	const user = userInput.value;
	const file = fileInput.files[0];
	const repeats = repeatsInput.valueAsNumber || 1;
	const randomizeFile = $(randomizeFileCheckbox).checkbox("is checked");
	const browser = $(browserDropdown).dropdown("get value");
	const proxiesFile = proxiesFileInput.files[0];

	const validate = !(user === "" || !file || browser === "");
	if (!validate) {
		showToast("Warning", "warning", "Couldn't start because not all boxes are filled");
		return;
	}

	const driverExists = utils.checkWebDriverExistence(browser);
	if (!driverExists) driverSetPath(browser);

	const inputFile = fs.readFileSync(file.path, { encoding: "utf8" });
	const messages = randomizeFile ? utils.shuffle(inputFile.split(/\r?\n/)) : inputFile.split(/\r?\n/);
	const ogMessages = inputFile.split(/\r?\n/);

	const inputProxiesFile = proxiesFile ? fs.readFileSync(proxiesFile.path, { encoding: "utf8" }) : null;
	const proxies = proxiesFile
		? inputProxiesFile.split(/\r?\n/).filter((proxy) => constants.PROXY_REGEX.test(proxy))
		: null;

	spammer = new Spammer(user, browser);

	loading(true, "Checking user existence...");
	const { id } = userCache.get(user) || (await getUser(user));
	if (!id) {
		conclude();
		return;
	}
	store.set("user", user);

	started = true;
	startStop(true);

	loading(true, "Getting token...<br/><br/>(complete captcha manually if present!)");
	const init = await spammer.init();
	if (!init) {
		conclude();
		return;
	}
	loading(false);

	for (let i = 0; i < repeats; i++) {
		for (const message of messages) {
			if (message.length < 4 || message.length > 15000) {
				log(`Message #${ogMessages.indexOf(message)} is not within the limits.`);
				continue;
			}

			if (!started) break;

			log(`Sending message #${ogMessages.indexOf(message)}.`);

			for (let tries = 0; tries < constants.RETRIES; tries++) {
				const proxy = proxiesFile ? proxies[Math.floor(Math.random() * proxies.length)].toString() : null;

				let valid = null;
				try {
					valid = await spammer.send(message, id, proxy);
				} catch {
					conclude();
					return;
				}

				if (!started) break;

				await utils.delay(1000);

				if (valid[0] === true) {
					log(`Message #${ogMessages.indexOf(message)} sent successfully.`);
					break;
				} else if (valid[0] === false) {
					log(`[${valid[1]}] Failed to send message #${ogMessages.indexOf(message)}.`);
					if (tries > constants.RETRIES) {
						log("Max retries exceeded. Giving up.");
						conclude();
						return;
					}
				}
			}
		}
	}

	log(`✔️ Spam completed! Sent all messages to ${user}!`);
	conclude();
});

logsButton.addEventListener("click", () => $(logsModal).modal("show"));

logsClearButton.addEventListener("click", () => {
	logsTextarea.value = "";
});

checkUpdates().then(([isLatest, latestVersion]) => {
	const updCheckFail = isLatest === null;
	const updateStatus = isLatest ? "success" : updCheckFail ? "warning" : "error";

	if (updateStatus === "warning") {
		$(updateNag).nag();
		$(updateText).text("Update check failed!");
	} else if (updateStatus === "error") {
		$(updateNag).nag();
		$(updateText).text(`Update v${latestVersion} is available!`);
	}

	$(versionText).text(`v${_VERSION_}`).addClass(updateStatus);
});
