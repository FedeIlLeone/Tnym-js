/* eslint-disable no-await-in-loop */
/* eslint-env browser, jquery */
const { readFileSync } = require("fs");
const os = require("os");
const path = require("path");
const fetch = require("node-fetch");
const Store = require("electron-store");
const Spammer = require("../structures/Spammer");
const constants = require("../util/constants");
const utils = require("../util/utils");

const loadingDimmer = document.getElementById("loading-dimmer");
const closeButton = document.getElementById("close-button");
const userInput = document.getElementById("user-input");
const fileInput = document.getElementById("file-input");
const repeatsInput = document.getElementById("repeats-input");
const fileAttachButton = document.getElementById("fileattach-button");
const browserDropdown = document.getElementById("browser-dropdown");
const latestTokenCheckbox = document.getElementById("latesttoken-checkbox");
const startButton = document.getElementById("start-button");
const startIcon = document.getElementById("start-icon");
const versionText = document.getElementById("version-text");

require("../../semantic/dist/semantic.min.js");
require("../../semantic/dist/semantic.min.css");

const store = new Store();

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

function loading(state, msg) {
	if (msg) loadingDimmer.firstElementChild.innerHTML = msg;
	$(loadingDimmer).removeClass(state ? "ui dimmer" : "ui active dimmer").addClass(state ? "ui active dimmer" : "ui dimmer");
}

function startStop(state) {
	startButton.firstElementChild.innerHTML = state ? "Stop" : "Start";
	$(startIcon).removeClass(state ? "play icon color green" : "stop icon color red").addClass(state ? "stop icon color red" : "play icon color green");
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

async function checkUpdates() {
	let response = null;
	try {
		response = await fetch(constants.UPDATE_URL).then((res) => res.json());
	} catch {
		return [null];
	}

	// eslint-disable-next-line no-undef
	const currentVersion = _VERSION_.replaceAll(".", "");
	const latestVersion = response.version.replaceAll(".", "");

	if (currentVersion >= latestVersion) {
		return [true];
	}

	return [false, response.version];
}

closeButton.onclick = () => {
	if (spammer) spammer.close();
	window.close();
};

userInput.value = store.get("user", "");

$("input:text").click(function () {
	$(this).parent().find("input:file").click();
});
fileAttachButton.onclick = () => {
	$(fileAttachButton).parent().find("input:file").click();
};
$("input:file", ".ui.action.input").on("change", function (e) {
	const file = e.target.files[0];
	$("input:text", $(e.target).parent()).val(file ? file.name : "");
});

repeatsInput.oninput = function () {
	const number = repeatsInput.value;
	if (number) {
		repeatsInput.value = Math.floor(number);
		if (number < 1 || number > 100) {
			repeatsInput.value = Math.min(Math.max(parseInt(number), 1), 100);
		}
	} else {
		repeatsInput.value = "";
	}
};

$(browserDropdown).dropdown({
	clearable: false
});

$(".activating.element").popup();
if (store.has("token")) $(latestTokenCheckbox).checkbox("set enabled");

startButton.onclick = async () => {
	if (started) {
		started = false;
		loading(true, "Completing last task...");
		return;
	}

	const user = userInput.value;
	const file = fileInput.files[0];
	const repeats = repeatsInput.valueAsNumber || 1;
	const browser = $(browserDropdown).dropdown("get value");
	const useLatestToken = $(latestTokenCheckbox).checkbox("is checked");

	const validate = (user === "" || !file || browser === "") ? false : true;
	if (!validate) {
		showToast("Warning", "warning", "Couldn't start because not all boxes are filled");
		return;
	}

	const driverExists = utils.checkWebDriverExistence(browser);
	if (!driverExists) {
		driverSetPath(browser);
	}

	const inputFile = readFileSync(file.path, {
		encoding: "utf-8"
	});
	const messages = inputFile.split(/\r?\n/);

	spammer = new Spammer(user, browser, useLatestToken);

	loading(true, "Checking user existence...");
	const userId = await spammer.getUserId(user);
	if (!userId) {
		showToast("Warning", "warning", `${user} doesn't exist on Tellonym`);
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
	} else {
		$(latestTokenCheckbox).checkbox("set enabled");
	}
	loading(false);

	for (let i = 0; i < repeats; i++) {
		for (const message of messages) {
			if (message.length < 4 || message.length > 15000) {
				continue;
			}

			if (!started) break;

			for (let tries = 0; tries < constants.RETRIES; tries++) {
				let valid = null;
				try {
					valid = await spammer.send(message, userId);
				} catch {
					conclude();
					return;
				}

				if (!started) break;

				await utils.delay(1000);

				if (valid === true) {
					break;
				} else if (valid === false) {
					if (tries > constants.RETRIES) {
						conclude();
						return;
					}
				}
			}
		}
	}

	await utils.delay(1000);
	conclude();
};

checkUpdates().then(([isLatest, latestVersion]) => {
	const updCheckFail = isLatest === null;

	// eslint-disable-next-line no-undef
	versionText.innerHTML = `<span class="ui inverted ${isLatest ? "success" : (updCheckFail ? "warning" : "error")} text">v${_VERSION_}</span>`;

	versionText.onclick = async () => {
		showToast("Update Check", updCheckFail ? "warning" : "info", isLatest ? "Up to date!" : (updCheckFail ? "Update check failed." : `Update v${latestVersion} is available!`));
	};
});