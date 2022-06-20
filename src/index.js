const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");

const DEBUG = false;

let win = null;

function createWindow() {
	win = new BrowserWindow({
		width: 400,
		height: 325,
		center: true,
		resizable: false,
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
	win.loadFile("./build/web/index.html");

	if (DEBUG) {
		win.webContents.openDevTools({ mode: "undocked" });
	}
}

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

ipcMain.on("set-proxy", (event, proxy) => {
	win.webContents.session.setProxy({ proxyRules: proxy });
});
