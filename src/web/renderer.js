/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
const { dialog } = require("electron").remote;
const { readFileSync } = require("fs");
const Spammer = require("../structures/Spammer");
const Constants = require("../util/Constants");
const Util = require("../util/Util");

const loadingDimmer = document.getElementById("loading-dimmer");
const closeButton = document.getElementById("close-button");
const userInput = document.getElementById("user-input");
const fileInput = document.getElementById("file-input");
const fileAttachButton = document.getElementById("fileattach-button");
const browserDropdown = document.getElementById("browser-dropdown");
const headlessCheckbox = document.getElementById("headless-checkbox");
const startButton = document.getElementById("start-button");
const startIcon = document.getElementById("start-icon");

require("../../semantic/dist/semantic.min.js");
require("../../semantic/dist/semantic.min.css");

let started = false;
let spammer;

function validateArgs(user, file, browser) {
	let valid = (user === "" || !file || browser === "") ? false : true;

	$(userInput).parent().removeClass(user === "" ? "ui fluid input" : "ui fluid input error").addClass(user === "" ? "ui fluid input error" : "ui fluid input");
	$(fileInput).parent().removeClass(!file ? "ui fluid action input" : "ui fluid action input error").addClass(!file ? "ui fluid action input error" : "ui fluid action input");
	$(browserDropdown).removeClass(browser === "" ? "ui inverted fluid selection dropdown" : "ui fluid selection dropdown error").addClass(browser === "" ? "ui fluid selection dropdown error" : "ui inverted fluid selection dropdown");

	return valid;
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

closeButton.onclick = () => {
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

$(browserDropdown).dropdown({
	clearable: false
});

startButton.onclick = async () => {
	if (started) {
		started = false;
		loading(true, "Completing last task...");
		return;
	}

	let user = userInput.value;
	let file = fileInput.files[0];
	let browser = $(browserDropdown).dropdown("get value");
	let headless = $(headlessCheckbox).checkbox("is checked");

	let validate = validateArgs(user, file, browser);
	if (!validate) {
		return;
	}

	let driverExists = Util.checkWebDriverExistence(browser);
	if (!driverExists) {
		dialog.showMessageBox(null, {
			message: `Couldn't find and run ${browser}'s WebDriver`,
			type: "warning",
			title: "WebDriver Warning"
		});
		return;
	}

	started = true;
	startStop(true);

	let inputFile = "";
	let messages = [];
	inputFile = readFileSync(file.path, {
		encoding: "utf-8"
	});
	messages = inputFile.split(/\r?\n/);

	spammer = new Spammer(user, browser, headless);
	loading(true, "Opening Browser and Tellonym...");
	let load = await spammer.load();
	if (!load) {
		conclude();
		return;
	}
	loading(false);

	for (const message of messages) {
		if (message.length < 4 || message.length > 15000) {
			continue;
		}

		if (!started) break;

		for (let tries = 0; tries < Constants.RETRIES; tries++) {
			let result;
			try {
				result = await spammer.send(message);
			} catch {
				conclude();
				return;
			}

			if (!started) break;

			if (result === true) {
				break;
			} else if (result === false) {
				if (tries > Constants.RETRIES) {
					conclude();
					return;
				}
			}

			await Util.delay(1000);
		}
	}

	await Util.delay(1000);
	conclude();
};