const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const version = JSON.parse(fs.readFileSync("./package.json", {
	encoding: "utf8"
})).version;

module.exports = () => {
	const public = path.resolve(__dirname, "./build/web");
	const htmlPlugin = new HtmlWebpackPlugin({
		template: "./src/web/index.html",
		filename: path.resolve(public, "index.html")
	});

	const config = {
		target: "electron-renderer",
		node: {
			__dirname: false
		},
		entry: {
			jquery: "./src/web/jquery.js",
			bundle: "./src/web/renderer.js"
		},
		output: {
			path: public,
			filename: "js/[name].js"
		},
		resolve: {
			extensions: [".js"]
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"]
				},
				{
					test: /\.(png|svg|jpg|gif)$/,
					type: "asset/resource",
					generator: {
						filename: "./images/[name][ext]"
					}
				},
				{
					test: /\.(ttf|eot|woff|woff2)$/,
					type: "asset/resource",
					generator: {
						filename: "./fonts/[name][ext]"
					}
				}
			]
		},
		plugins: [
			htmlPlugin,
			new webpack.DefinePlugin({
				_VERSION_: JSON.stringify(version)
			})
		]
	};

	return config;
};