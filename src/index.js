const { app, BrowserWindow } = require("electron");

function createWindow() {
	const win = new BrowserWindow({
		width: 400,
		height: 515,
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