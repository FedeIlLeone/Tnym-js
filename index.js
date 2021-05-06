/* eslint-disable no-await-in-loop */
const minimist = require("minimist");
const { stripIndents } = require("common-tags");
const { access } = require("fs/promises");
const { constants, readFileSync } = require("fs");
const Spammer = require("./structures/Spammer");
const Util = require("./util/Util");

let argv = minimist(process.argv.slice(2), {
	alias: {
		h: "help",
		i: "input",
		t: "times",
		r: "retries",
		b: "browser"
	},
	boolean: "h",
	default: {
		i: "null",
		t: 1,
		r: 10,
		b: "chrome"
	},
	string: ["i", "b"]
});

async function validateArgs(args) {
	if (args.help) {
		console.log(stripIndents`
			\x1b[1m\x1b[41mTnym.js Help\x1b[0m
			Usage: node . [-h] [-i INPUT] [-t TIMES] [-r RETRIES] [-b BROWSER] user

			\x1b[4mRequired Arguments:\x1b[0m
				user			(string)		Name of the target user.
				-i or -input		(path to txt)		Input file with the messages that have to be sent.

			\x1b[4mOptional Arguments:\x1b[0m
				-h or -help		(bool) 			Shows an help message regarding the tool.
				-t or -times		(integer) 		Set the number of times to loop the input file. Defaults to 1 time.
				-r or -retries		(integer) 		Set the number of times to retry the operation of sending the message if fails. Defaults to 10 retries.
				-b or -browser		(string)		Set the browser to use (chrome, firefox, edge). Defaults to chrome.
		`);
		return false;
	}

	// User validator
	if (args._.length === 0) {
		console.warn("\x1b[33m%s\x1b[0m", "You have to specify the target user.");
		return false;
	}

	// Input file validator
	try {
		await access(args.input, constants.R_OK);
	} catch {
		console.error("\x1b[31m%s\x1b[0m", "The inserted `input` argument path is invalid.");
		return false;
	}

	// Times validator
	if (typeof args.times !== "number") {
		console.error("\x1b[31m%s\x1b[0m", "The `times` argument has to be a number.");
		return false;
	}

	// Retries validator
	if (typeof args.retries !== "number") {
		console.error("\x1b[31m%s\x1b[0m", "The `retries` argument has to be a number.");
		return false;
	}

	// Browser validator
	if (!Util.checkBrowserCompatibility(args.browser)) {
		console.error("\x1b[31m%s\x1b[0m", `${args.browser} is invalid or not supported.`);
		return false;
	}

	return true;
}

async function main() {
	let user = argv._[0];
	let inputFile = "";
	let messages = [];

	console.log(`Starting Tnym.js to spam ${user}`);

	inputFile = readFileSync(argv.input, {
		encoding: "utf-8"
	});

	messages = inputFile.split(/\r?\n/);

	const spammer = new Spammer(user, argv.browser);

	for (let i = 0; i < argv.times; i++) {
		for (const message of messages) {
			if (message.length < 4) {
				console.warn("\x1b[33m%s\x1b[0m", "Message too short. Minimum is 4 characters.");
				continue;
			} else if (message.length > 15000) {
				console.warn("\x1b[33m%s\x1b[0m", "Message too long. Maximum is 15000 characters.");
				continue;
			}

			console.log(`Sending message: ${message}`);

			for (let tries = 0; tries < argv.retries; tries++) {
				let result = await spammer.send(message);

				if (result === true) {
					console.log("\x1b[32m%s\x1b[0m", "Message sent successfully.");
					break;
				} else if (result === false) {
					if (tries > argv.retries) {
						console.error("\x1b[31m%s\x1b[0m", "Max retries exceeded. Giving up.");
						spammer.close();
						process.exit(1);
					} else {
						console.error("\x1b[31m%s\x1b[0m", "Failed to send message. Retrying...");
					}
				}

				await Util.delay(1000);
			}
		}
	}

	console.log("\x1b[32m%s\x1b[0m", `Spam completed! Sent all messages to ${user}.`);
}

validateArgs(argv).then((valid) => {
	if (valid === true) {
		main();
	}
});