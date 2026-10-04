// 预加载脚本：向渲染进程暴露最小安全 API
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petBridge', {
  // 鼠标进入/离开形象区域时切换窗口交互性
  setInteractive: (interactive) => ipcRenderer.send('pet:set-interactive', interactive),
  // 拖拽移动窗口
  moveBy: (dx, dy) => ipcRenderer.send('pet:move-by', { dx, dy }),
  // 语音包目录（只读）
  voicepackDir: () => ipcRenderer.invoke('config:voicepack-dir'),
});
