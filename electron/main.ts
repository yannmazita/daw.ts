import { app, BrowserWindow } from 'electron';

class Main {
    mainWindow: BrowserWindow | null = null;

    init() {
        app.on('ready', this.createWindow);
        app.on('window-all-closed', this.onWindowAllClosed);
        app.on('activate', this.onActivate);
    }

    private createWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        });

        this.mainWindow.loadURL('http://localhost:5173');
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    private onWindowAllClosed(): void {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }

    private onActivate(): void {
        if (BrowserWindow.getAllWindows().length === 0) {
            this.createWindow();
        }
    }
}

const main = new Main();
main.init();
