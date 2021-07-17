const { app, BrowserWindow } = require("electron");
require("@electron/remote/main").initialize();

const DEBUG = false;

function createWindow() {
	const win = new BrowserWindow({
		width: 400,
		height: 520,
		center: true,
		resizable: false,
		maximizable: false,
		fullscreenable: false,
		frame: false,
		titleBarStyle: "hidden",
		icon: "./assets/icon.ico",
		webPreferences: {
			contextIsolation: false,
			enableRemoteModule: true,
			nodeIntegration: true
		}
	});
	win.setTitle("Tnym-js");
	win.setMenu(null);
	win.loadFile("./build/web/index.html");

	if (DEBUG) {
		win.webContents.openDevTools({
			mode: "undocked"
		});
	}
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});