const { app, BrowserWindow } = require("electron");
const remoteMain = require("@electron/remote/main");
const Store = require("electron-store");

const DEBUG = false;

function createWindow() {
	const win = new BrowserWindow({
		width: 400,
		height: 520,
		center: true,

		/*
			TODO: Remember to remove these limits and set back resizable to false
			when the issue (https://github.com/electron/electron/issues/30788) gets fixed
		*/
		minWidth: 400,
		minHeight: 520,
		maxWidth: 400,
		maxHeight: 520,
		resizable: true,

		maximizable: false,
		fullscreenable: false,
		frame: false,
		titleBarStyle: "hidden",
		icon: "./assets/icon.ico",
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true
		}
	});
	win.setTitle("Tnym-js");
	win.setMenu(null);
	remoteMain.enable(win.webContents);
	win.loadFile("./build/web/index.html");

	if (DEBUG) {
		win.webContents.openDevTools({
			mode: "undocked"
		});
	}
}

remoteMain.initialize();
Store.initRenderer();

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