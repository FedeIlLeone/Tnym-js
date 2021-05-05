/* eslint-disable no-await-in-loop */
const minimist = require("minimist");
const { stripIndents } = require("common-tags");
const { access } = require("fs/promises");
const { constants, readFileSync } = require("fs");
const SpammerAPI = require("./structures/SpammerAPI");
const Util = require("./structures/Util");

let argv = minimist(process.argv.slice(2), {
	alias: {
		i: "input",
		t: "times",
		r: "retries"
	},
	boolean: "h",
	default: {
		i: "null",
		t: 1,
		r: 10
	},
	string: "i"
});

async function validateArgs(args) {
	if (args.h) {
		console.log(stripIndents`
			\x1b[1m\x1b[41mTnym.js Help\x1b[0m
			Usage: node . [-h] [-i INPUT_FILE] [-t TIMES] [-r RETRIES] user

			\x1b[4mRequired Arguments:\x1b[0m
				user			(string)		Name of the target user.
				-i or -input		(path to txt)		Input file with the messages that have to be sent.

			\x1b[4mOptional Arguments:\x1b[0m
				-h or -help		(bool) 			Shows an help message regarding the tool.
				-t or -times		(integer) 		Set the number of times to loop the input file.
				-r or -retries		(integer) 		Set the number of times to retry the operation of sending the message if fails.
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
		await access(args.i, constants.R_OK);
	} catch {
		console.error("\x1b[31m%s\x1b[0m", "The inserted `input` argument path is invalid.");
		return false;
	}

	// Times validator
	if (typeof args.t !== "number") {
		console.error("\x1b[31m%s\x1b[0m", "The `times` argument has to be a number.");
		return false;
	}

	// Retries validator
	if (typeof args.r !== "number") {
		console.error("\x1b[31m%s\x1b[0m", "The `retries` argument has to be a number.");
		return false;
	}

	return true;
}

async function main() {
	console.log("Starting Tnym.js");

	let user = argv._[0];
	let inputFile = "";
	let messages = [];

	inputFile = readFileSync(argv.i, {
		encoding: "utf-8"
	});

	messages = inputFile.split(/\r?\n/);

	const spammer = new SpammerAPI(user, argv.t);

	for (let i = 0; i < argv.t; i++) {
		for (const message of messages) {
			console.log(`Sending message: ${message}`);

			for (let tries = 0; tries < argv.r; tries++) {
				let result = await spammer.send(message);
				if (result === true) {
					console.log("\x1b[32m%s\x1b[0m", "Message sent successfully.");
					break;
				} else if (result === false) {
					if (tries > argv.r) {
						console.error("\x1b[31m%s\x1b[0m", "Max retries exceeded. Giving up.");
						spammer.close();
						process.exit(1);
					} else {
						console.error("\x1b[31m%s\x1b[0m", "Failed to send message. Retrying...");
						tries += 1;
					}
				}

				await Util.delay(1000);
			}
		}
	}
}

validateArgs(argv).then((valid) => {
	if (valid === true) {
		main();
	}
});