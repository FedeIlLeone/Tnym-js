/* eslint-disable no-await-in-loop */
/* eslint-env browser, jquery */
const { dialog } = require("@electron/remote");
const { readFileSync } = require("fs");
const os = require("os");
const path = require("path");
const fetch = require("node-fetch");
const settings = require("electron-settings");
const Spammer = require("../structures/Spammer");
const Constants = require("../util/Constants");
const Util = require("../util/Util");

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

let started = false;
let spammer = null;

async function showMessageBox(title, type, message) {
	await dialog.showMessageBox(null, {
		message: message,
		type: type,
		title: title
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
	let driverFileName = Util.getDriverFileName(browser);

	if (osArch === "arm" || osArch === "ia32") osArch = "x32";
	if (osArch === "arm64") osArch = "x64";

	let driverPath = path.join(process.resourcesPath, "drivers", driverFileName, osArch);

	process.env.path += `;${driverPath}`;
}

async function checkUpdates() {
	// eslint-disable-next-line no-undef
	let currentVersion = _VERSION_.replaceAll(".", "");

	let response = null;
	try {
		response = await fetch(Constants.UPDATE_URL).then((res) => res.json());
	} catch {
		return [null];
	}

	let latestVersion = response.version.replaceAll(".", "");

	if (currentVersion >= latestVersion) {
		return [true];
	}

	return [false, response.version];
}

closeButton.onclick = () => {
	if (spammer) spammer.close();
	window.close();
};

$("input:text").click(function () {
	$(this).parent().find("input:file").click();
});
fileAttachButton.onclick = () => {
	$(fileAttachButton).parent().find("input:file").click();
};
$("input:file", ".ui.action.input").on("change", function (e) {
	let file = e.target.files[0];
	$("input:text", $(e.target).parent()).val(file ? file.name : "");
});

repeatsInput.oninput = function () {
	let number = repeatsInput.value;
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
settings.has("token").then((res) => {
	if (res) $(latestTokenCheckbox).checkbox("set enabled");
});

startButton.onclick = async () => {
	if (started) {
		started = false;
		loading(true, "Completing last task...");
		return;
	}

	let user = userInput.value;
	let file = fileInput.files[0];
	let repeats = repeatsInput.valueAsNumber || 1;
	let browser = $(browserDropdown).dropdown("get value");
	let useLatestToken = $(latestTokenCheckbox).checkbox("is checked");

	let validate = (user === "" || !file || browser === "") ? false : true;
	if (!validate) {
		showMessageBox("Warning", "warning", "Couldn't start because not all boxes are filled");
		return;
	}

	let driverExists = Util.checkWebDriverExistence(browser);
	if (!driverExists) {
		driverSetPath(browser);
	}

	let inputFile = "";
	let messages = [];
	inputFile = readFileSync(file.path, {
		encoding: "utf-8"
	});
	messages = inputFile.split(/\r?\n/);

	spammer = new Spammer(user, browser, useLatestToken);

	loading(true, "Checking user existence...");
	let userId = await spammer.getUserId(user);
	if (!userId) {
		showMessageBox("Warning", "warning", `${user} doesn't exist on Tellonym`);
		return;
	}

	started = true;
	startStop(true);

	loading(true, "Getting token...<br/><br/>(complete captcha manually if present!)");
	let init = await spammer.init();
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

			for (let tries = 0; tries < Constants.RETRIES; tries++) {
				let valid = null;
				try {
					valid = await spammer.send(message, userId);
				} catch {
					conclude();
					return;
				}

				if (!started) break;

				await Util.delay(1000);

				if (valid === true) {
					break;
				} else if (valid === false) {
					if (tries > Constants.RETRIES) {
						conclude();
						return;
					}
				}
			}
		}
	}

	await Util.delay(1000);
	conclude();
};

checkUpdates().then(([isLatest, latestVersion]) => {
	let updCheckFail = isLatest === null;

	// eslint-disable-next-line no-undef
	versionText.innerHTML = `<span class="ui inverted ${isLatest ? "success" : (updCheckFail ? "warning" : "error")} text">v${_VERSION_}</span>`;

	let pressed = false;
	versionText.onclick = async () => {
		if (pressed) return;
		pressed = true;
		await showMessageBox("Update Check", updCheckFail ? "warning" : "info", isLatest ? "Up to date!" : (updCheckFail ? "Update check failed." : `Update v${latestVersion} is available!`));
		pressed = false;
	};
});