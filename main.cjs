const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require('electron')
const path = require('path')
const os = require('os')

const log = require('electron-log')

// set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false
log.info(process.platform)

let mainWindow
let aboutWindow
import('./createWindow.mjs').then(({ createMainWindow }) => {
  app.whenReady().then(async () => {
    mainWindow = await createMainWindow(BrowserWindow, isDev)

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    globalShortcut.register('CommandOrControl+R', () => {
      mainWindow.reload()
    })
    globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () => {
      mainWindow.toggleDevTools()
    })

    // 清除 缓存
    mainWindow.on('ready', () => (mainWindow = null))
    app.on('window-all-closed', () => {
      if (!isMac) app.quit()
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  const menu = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: 'About',
                click: import('./createWindow.mjs').then(
                  ({ createAboutWindow }) =>
                    createAboutWindow(BrowserWindow, isDev)
                ),
              },
            ],
          },
        ]
      : []),
    // {
    // label: 'Files',
    // submenu: [
    //   {
    //     label: 'Quit',
    //     // accelerator: isMac ? 'Command + W' : 'Ctrl + W',
    //     accelerator: 'CmdOrCtrl + W',
    //     click: () => app.quit(),
    //   },
    // ],
    // },
    {
      role: 'fileMenu',
    },
    ...(!isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: 'About',
                click: import('./createWindow.mjs').then(
                  ({ createAboutWindow: C }) => C
                ),
              },
            ],
          },
          Ï,
        ]
      : []),
    ...(isDev
      ? [
          {
            label: 'Developer',
            submenu: [
              { role: 'reload' },
              { role: 'forcereload' },
              { type: 'separator' },
              { role: 'toggledevtools' },
            ],
          },
        ]
      : []),
  ]
  //

  ipcMain.on('image:minimize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageshrink')
    log.info(options.dest, '<====dest')
    shrinkImage(options)
  })

  async function shrinkImage({ imgPath, quality, dest }) {
    try {
      Promise.all([
        import('slash'),
        import('imagemin'),
        import('imagemin-mozjpeg'),
        import('imagemin-pngquant'),
      ]).then(async ([slash, imagemin, imageminMozjpeg, imageminPngquant]) => {
        const pngQuality = quality / 100
        const files = await imagemin.default([slash.default(imgPath)], {
          destination: dest,
          plugins: [
            imageminMozjpeg.default({ quality }),
            imageminPngquant.default({
              quality: [pngQuality, pngQuality],
            }),
          ],
        })
        log.warn(files, dest, '<===== files, dest')
        shell.openPath(dest)

        // ipc: main -> render
        mainWindow.webContents.send('image:done')
      })
    } catch (error) {
      log.error(error, '<===error')
    }
  }
})
