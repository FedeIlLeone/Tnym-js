const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (_, argv) => {
	const isProd = (argv.mode === "production");
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
					test: /\.scss$/,
					use: [
						{
							loader: "css-loader",
							options: {
								sourceMap: !isProd
							}
						},
						{
							loader: "sass-loader",
							options: {
								sourceMap: !isProd,
								outFile: "./build/css/main.css",
								minimize: true
							}
						}
					]
				},
				{
					test: /\.html$/,
					exclude: path.join(__dirname, "src", "web", "index.html"),
					use: {
						loader: "file-loader",
						options: {
							name: "[name].[ext]"
						}
					}
				},
				{
					test: /\.(png|svg|jpg|gif)$/,
					use: {
						loader: "file-loader",
						options: {
							name: "./imgs/[name].[ext]"
						}
					}
				},
				{
					test: /\.(ttf|eot|woff|woff2)$/,
					use: {
						loader: "file-loader",
						options: {
							name: "./fonts/[name].[ext]"
						}
					}
				}
			]
		},
		plugins: [htmlPlugin]
	};
	
	return config;
};