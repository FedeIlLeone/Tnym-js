# Tnym-js

Tnym-js is an automated tool to spam users on the noted website [Tellonym](https://tellonym.me/).

## Installation

The tool is made in JavaScript and ran with some [Node.js](https://nodejs.org/) packages.

Run this command to get all dependencies of the project.
```shell
$ npm run build
```

You're required to use chrome as the webdriver. You can get `chromedriver` [here](https://chromedriver.chromium.org/). Remember to add the the driver in $PATH.

## CLI

Usage: `node . [-h] [-i INPUT_FILE] [-t TIMES] [-r RETRIES] user`

| Argument | Type | Description |
|-------------|-------------|---------------|
| `user`     | string | (REQUIRED) Name of the target user. |
| `-i or -input`   | path to txt | (REQUIRED) Input file with the messages that have to be sent. |
| `-h or -help` | bool | Shows an help message regarding the tool. |
| `-t or -times` | integer | Set the number of times to loop the input file. |
| `-r or -retries` | integer | Set the number of times to retry the operation of sending the message if fails. |