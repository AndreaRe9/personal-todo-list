'use strict'
const electron = require('electron')
const app = electron.app
const path = require('path')
const config = require(path.join(__dirname, 'package.json'))
const model = require(path.join(__dirname, 'js', 'model.js'))
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu

Menu.setApplicationMenu(false)

app.setName(config.officialName)
var mainWindow = null
app.on('ready', function () {
  mainWindow = new BrowserWindow({
    title: config.officialName,
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      defaultEncoding: 'UTF-8'
    }
  })

  model.initDb(app.getPath('userData'),
    mainWindow.loadFile(`html/index.html`)
  )

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
})

app.on('window-all-closed', () => { app.quit() })