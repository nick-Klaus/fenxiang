'use strict';
const path = require('path');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const IpcMain = electron.ipcMain
const App = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
let appWindow = null;
let appIcon = null;
const shouldQuit = App.makeSingleInstance(function(commandLine, workingDirectory) {
    // 当另一个实例运行的时候，这里将会被调用，我们需要激活应用的窗口
    if (appWindow) {
        if (appWindow.isMinimized()) {
            appWindow.restore();
        } else {
            appWindow.focus();
        }
    }
    return true;
});
// 这个实例是多余的实例，需要退出
if (shouldQuit) {
    return App.quit();
}
App.on('ready', function() {
    appWindow = new BrowserWindow({
        width: 1000,
        height: 680,
        frame: false,
        center: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'background.js')
        }
    });
    appWindow.webContents.openDevTools();
    appWindow.loadURL(path.join(__dirname, 'default.html'));
    var isVisible = appWindow.isVisible(); // 窗口是否可见
    var isAlwaysOnTop = appWindow.isAlwaysOnTop(); // 窗口是否始终在其它窗口之前
    var isDevToolsOpened = appWindow.webContents.isDevToolsOpened(); // 是否已打开控制台
    appIcon = new Tray(path.join(__dirname, 'logo.png'));
    appIcon.setToolTip('点击最大化 / 最小化窗口');
    appIcon.setContextMenu(contentMenu());
    appIcon.on("click", function() {
        isVisible ? appWindow.hide() : appWindow.show();
        isVisible = isVisible === false;
        appWindow.setSkipTaskbar(!isVisible)
        appIcon.setContextMenu(contentMenu());
    })
    IpcMain.on("window.contents", function() {
        isDevToolsOpened ? appWindow.webContents.closeDevTools() : appWindow.webContents.openDevTools();
        isDevToolsOpened = isDevToolsOpened === false;
        if (isVisible) { appWindow.show(); }
        appIcon.setContextMenu(contentMenu());
    }); // 控制台
    IpcMain.on("window.all.closed", function() { App.quit(); }); // 退出应用
    IpcMain.on("window.all.reload", function() {
        App.relaunch({args: process.argv.slice(1).concat(['--relaunch'])});
        App.exit(0);
    }); // 退出应用
    IpcMain.on("window.all.hide", function() {
        isVisible ? appWindow.hide() : appWindow.show();
        isVisible = isVisible === false;
        appWindow.setSkipTaskbar(!isVisible)
        appIcon.setContextMenu(contentMenu());
    }); // 最小化应用
    function contentMenu() {
        isVisible = appWindow.isVisible(); // 窗口是否可见
        isAlwaysOnTop = appWindow.isAlwaysOnTop(); // 窗口是否始终在其它窗口之前
        isDevToolsOpened = appWindow.webContents.isDevToolsOpened(); // 是否已打开控制台
        return Menu.buildFromTemplate([{
                label: (isAlwaysOnTop ? '取消居顶' : '始终居顶'),
                click: function() {
                    isAlwaysOnTop = isAlwaysOnTop === false;
                    appWindow.setAlwaysOnTop(isAlwaysOnTop);
                    if (isVisible) { appWindow.show(); }
                    appIcon.setContextMenu(contentMenu());
                }
            },
            {
                label: (isVisible ? '最小化窗口' : '还原窗口'),
                click: function() {
                    isVisible ? appWindow.hide() : appWindow.show();
                    isVisible = isVisible === false;
                    appWindow.setSkipTaskbar(!isVisible)
                    appIcon.setContextMenu(contentMenu());
                }
            },
            {
                label: (isDevToolsOpened ? '关闭控制台' : '打开控制台'),
                click: function() {
                    isDevToolsOpened ? appWindow.webContents.closeDevTools() : appWindow.webContents.openDevTools();
                    isDevToolsOpened = isDevToolsOpened === false;
                    if (isVisible) { appWindow.show(); }
                    appIcon.setContextMenu(contentMenu());
                }
            },
            {
                label: '重启应用',
                click: function() {
                    appWindow.reload();
                    appIcon.setContextMenu(contentMenu());
                }
            },
            { label: '退出应用', click: function() { App.quit(); } },
        ]);
    }
});