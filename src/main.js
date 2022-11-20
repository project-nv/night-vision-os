const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const axios = require('axios')
require('@electron/remote/main').initialize()

/*
import {app, BrowserWindow } from 'electron'
import path from 'path'
import url from 'url'
import fetch from 'node-fetch'
*/
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var win, settings, hot_reload

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        //titleBarStyle: 'hidden'
        webPreferences: {
           nodeIntegration: true,
           contextIsolation: false,
           enableRemoteModule: true,
           //webviewTag: false,
           sandbox: false,
           //preload: path.join(__dirname, 'bridge_lite.js'),
       },
       backgroundColor: '#111'
    })

    // and load the index.html of the app.
    win.loadURL('http://localhost:16888')

    // Open the DevTools.
    win.webContents.openDevTools()
    win.setMenu(null)
    require("@electron/remote/main").enable(win.webContents)


    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    //require('./menu.js')
}


function waitForUrl() {
    axios.get('http://localhost:16888/index.html')
        .then(res => { if (!win) createWindow() })
        .catch(wrr => setTimeout(waitForUrl, 100))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => waitForUrl())

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})
