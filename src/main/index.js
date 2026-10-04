// 主进程入口：创建桌宠悬浮窗 + 系统托盘 + IPC
const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');

let petWin = null;

function createPetWindow() {
  petWin = new BrowserWindow({
    width: 240,
    height: 240,
    transparent: true,          // 透明背景，只显示形象
    frame: false,               // 无边框
    alwaysOnTop: true,          // 置顶
    resizable: false,
    skipTaskbar: true,          // 不占任务栏
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 默认鼠标穿透：渲染进程检测到悬停在形象上时才接管
  petWin.setIgnoreMouseEvents(true, { forward: true });

  // 初始位置：屏幕右下角
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  petWin.setPosition(width - 280, height - 300);

  petWin.loadFile(path.join(__dirname, '../renderer/index.html'));
}

function createTray() {
  // TODO: 换成正式托盘图标
  const tray = new Tray(path.join(__dirname, '../../assets/pet.png'));
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '切换语音包', submenu: [] }, // 启动后由 VoicePackManager 填充
    { label: '显示 / 隐藏', click: () => petWin.isVisible() ? petWin.hide() : petWin.show() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ]));
}

// 渲染进程请求切换「是否忽略鼠标事件」
ipcMain.on('pet:set-interactive', (_e, interactive) => {
  petWin?.setIgnoreMouseEvents(!interactive, { forward: true });
});

// 拖拽时渲染进程上报位移增量，主进程移动窗口
ipcMain.on('pet:move-by', (_e, { dx, dy }) => {
  if (!petWin) return;
  const [x, y] = petWin.getPosition();
  petWin.setPosition(x + dx, y + dy);
});

app.whenReady().then(() => {
  createPetWindow();
  createTray();
});

app.on('window-all-closed', () => app.quit());
