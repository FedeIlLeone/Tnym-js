const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const version = JSON.parse(fs.readFileSync("./package.json", {
	encoding: "utf8"
})).version;

module.exports = () => {
	const public = path.resolve(__dirname, "./build");

	const config = {
		target: "electron-main",
		externals: {
			bufferutil: "bufferutil",
			"utf-8-validate": "utf-8-validate"
		},
		node: {
			__dirname: false
		},
		entry: {
			main: path.join(__dirname, "src", "index.js")
		},
		output: {
			path: public,
			filename: "[name].js"
		},
		resolve: {
			extensions: [".js"]
		},
		plugins: [
			new webpack.DefinePlugin({
				_VERSION_: JSON.stringify(version)
			})
		]
	};

	return config;
};