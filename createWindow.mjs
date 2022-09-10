function createMainWindow(BrowserWindow, isDev) {
  const mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: isDev ? 800 : 500,
    height: 600,
    icon: './assets/icons/Icon_256x256.png',
    resizable: isDev ? true : false,
    backgroundColor: 'green',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.loadFile(`./app/index.html`)
  return mainWindow
}
function createAboutWindow(BrowserWindow, isDev) {
  const aboutWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 300,
    height: 300,
    icon: './assets/icons/Icon_256x256.png',
    resizable: isDev ? true : false,
    backgroundColor: 'green',
    webPreferences: {
      nodeIntegration: true,
    },
  })
  aboutWindow.loadFile(`./app/about.html`)
  return aboutWindow
}
export { createAboutWindow, createMainWindow }
