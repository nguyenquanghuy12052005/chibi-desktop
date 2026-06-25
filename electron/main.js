const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } = require('electron')
const path = require('path')

let win 
let tray 
let doNotDisturb = false // trạng thái Do Not Disturb



//tạo cửa sổ chính
function createWindow() {
  win = new BrowserWindow({
    width: 150,
    height: 150,
    transparent: true, //Cửa sổ trong suốt
    frame: false, //Loại bỏ khung cửa sổ
    alwaysOnTop: true, //luôn nằm trên mọi cửa sổ khác
    skipTaskbar: true, //Không hiện trên thanh taskbar
    resizable: false, //Không cho phép thay đổi kích thước
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true, //Bảo vệ an toàn
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadURL('http://localhost:5173')
  win.webContents.openDevTools({ mode: 'detach' })

  const display = screen.getPrimaryDisplay() 
  const { width, height } = display.workAreaSize // Lấy kích thước vùng làm việc (không bao gồm taskbar)
  win.setPosition(width - 170, height - 170)

  // ── Click-through: poll chuột từ main process ──
  win.setIgnoreMouseEvents(true, { forward: true }) // Cho phép sự kiện chuột đi qua cửa sổ


  // kiểm tra vị trí chuột và bật/tắt click-through
  setInterval(() => {
    const cursor = screen.getCursorScreenPoint()
    const bounds = win.getBounds()

    // Kiểm tra chuột có nằm trong bounds cửa sổ không
    const inside =
      cursor.x >= bounds.x &&
      cursor.x <= bounds.x + bounds.width &&
      cursor.y >= bounds.y &&
      cursor.y <= bounds.y + bounds.height

    win.setIgnoreMouseEvents(!inside, { forward: true })
  }, 50) // check mỗi 50ms
}



//Tạo biểu tượng khay hệ thống
function createTray() {

  
  const icon = nativeImage.createFromPath(path.join(__dirname, '../public/na.jpg'))
  tray = new Tray(icon)

  const menu = Menu.buildFromTemplate([
    { label: 'Hiện Chibi', click: () => win.show() },
    { label: 'Ẩn Chibi',   click: () => win.hide() },
      {
      label: 'Không làm phiền',
      type: 'checkbox',
      checked: false,
      click: (item) => {
        doNotDisturb = item.checked
        // Phase 2 dùng để skip cron quiz khi DND = true
      }
    },
{ label: '→ IDLE', click: () => sendChibiState('IDLE') },
{ label: '→ RUN', click: () => sendChibiState('RUN') },
{ label: '→ DRAG_CONFUSED', click: () => sendChibiState('DRAG_CONFUSED') },
{ label: '→ ALERT', click: () => sendChibiState('ALERT') },
{ label: '→ THINKING', click: () => sendChibiState('THINKING') },
{ label: '→ SUCCESS', click: () => sendChibiState('SUCCESS') },
{ label: '→ FAILED', click: () => sendChibiState('FAILED') },
{ label: '→ REST', click: () => sendChibiState('REST') },
    { type: 'separator' },
    { label: 'Thoát',      click: () => app.quit() }
  ])

  tray.setToolTip('Chibi Assistant')
  tray.setContextMenu(menu)


  function sendChibiState(stateName) {
  if (!win) return
  win.webContents.send('CHIBI_STATE', { state: stateName })
  console.log('[main] gửi CHIBI_STATE:', stateName)
}
}

// IPC: renderer gửi lên để test (optional)
ipcMain.on('CHIBI_STATE_FROM_RENDERER', (_, payload) => {
  console.log('renderer gửi:', payload)
})

// IPC: main process → renderer (cron sẽ dùng sau)
// Dùng: win.webContents.send('CHIBI_STATE', { state: 'ALERT' })


app.whenReady().then(() => {
  createWindow()
  createTray()
})