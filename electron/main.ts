import { app, BrowserWindow } from "electron";

class Main {
  mainWindow: BrowserWindow | null = null;

  init() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    app.on("ready", this.createWindow);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    app.on("window-all-closed", this.onWindowAllClosed);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    app.on("activate", this.onActivate);
  }

  private async createWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    await this.mainWindow.loadURL("http://localhost:5173");
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  private onWindowAllClosed(): void {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private async onActivate(): Promise<void> {
    if (BrowserWindow.getAllWindows().length === 0) {
      await this.createWindow();
    }
  }
}

const main = new Main();
main.init();
