# 架构设计

## 1. 总体分层

```
┌─────────────────────────────────────────────┐
│                 主进程 (main)                 │
│  窗口管理 · 系统托盘 · 全局快捷键 · IPC 路由    │
├─────────────────────────────────────────────┤
│              预加载层 (preload)               │
│        contextBridge 暴露最小安全 API         │
├─────────────────────────────────────────────┤
│               渲染进程 (renderer)             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │  PetView  │ │    FSM    │ │AudioEngine│  │
│  │ 形象渲染   │ │ 状态机    │ │ 音频播放   │  │
│  └───────────┘ └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │Interaction│ │VoicePack  │ │ EventBus  │  │
│  │ 交互采集   │ │ Manager   │ │ 事件总线  │  │
│  └───────────┘ └───────────┘ └───────────┘  │
└─────────────────────────────────────────────┘
```

设计原则：渲染进程内一切模块只通过 **EventBus** 通信，互不直接引用，
后续加新功能（新状态、新触发器、新动画）只需挂监听器，不改老代码。

## 2. 核心模块

### 2.1 窗口管理（主进程）
- `transparent + frameless + alwaysOnTop` 实现桌宠悬浮窗
- `setIgnoreMouseEvents` 配合 hover 检测实现「空白区域鼠标穿透」：
  默认穿透，渲染进程检测到鼠标进入形象区域时通知主进程接管
- 托盘菜单：切换语音包、显示/隐藏、退出

### 2.2 状态机 FSM（renderer/core/fsm.js）
初版五个状态，覆盖所有计划内互动：

| 状态 | 进入条件 | 表现 | 退出条件 |
|------|---------|------|---------|
| IDLE | 默认 / 其他状态结束 | 静态形象，随机眨眼/晃动 | 任意交互事件 |
| HOVER | 鼠标进入形象 | 轻微放大/高亮 | 鼠标离开 |
| DRAG | 按下并移动 | 跟随鼠标 | 松开（落点可选惯性/吸附屏幕边缘） |
| TALK | 触发语音 | 播放音频 + 嘴部动效/气泡文字 | 音频播完 |
| SLEEP | 长时间无交互 | 变暗/缩小 | 任意交互事件 |

状态迁移统一走 `fsm.transition(to, payload)`，进入/退出钩子
向 EventBus 广播 `state:enter` / `state:exit`，语音、动画各自订阅。

### 2.3 语音包系统
- **VoicePackManager**：扫描 `voicepacks/` 目录，读取各包 `pack.json`
  清单；`chokidar` 监听目录变化实现热加载
- **AudioEngine**：单例播放器，维护优先级与冷却，避免语音轰炸：
  - 高优先级事件（如点击）可打断低优先级（如闲聊）
  - 同一 trigger 冷却期内不重复触发
  - 多条候选按 weight 加权随机
- 事件映射：EventBus 的 `state:enter`、`ui:click` 等事件
  → 查语音包 manifest 中对应 trigger → 交给 AudioEngine

语音包格式详见 [VOICEPACK.md](VOICEPACK.md)。

### 2.4 事件总线 EventBus
极简发布订阅（on/off/emit），全应用唯一实例。
事件命名约定：`域:动作`，如 `state:enter` / `ui:click` / `voice:loaded`。

### 2.5 配置持久化
`electron-store` 保存：当前语音包、音量、窗口位置、是否开机自启。
主进程持有，渲染进程经 IPC 读写。

## 3. 关键交互链路（点击说话为例）

```
用户点击形象
  → Interaction 捕获 click，emit('ui:click')
  → FSM 监听后 transition('TALK')，emit('state:enter', TALK)
  → VoicePackManager 查 trigger 'on_click'，加权随机选一条
  → AudioEngine 播放音频；PetView 同步播放嘴部动效 + 气泡文字
  → 音频 ended → emit('voice:end') → FSM transition('IDLE')
```

## 4. 演进路线

- **v0.1**：本文档范围（五状态 + 语音包 + 拖拽）
- **v0.2**：动画序列帧 / APNG 形象，随机游走，屏幕边缘吸附
- **v0.3**：语音包商店式导入（zip 拖入即装），气泡字幕国际化
- **v0.4+**：可选 TTS 接入、Live2D 形象、多桌宠同屏

## 5. 非功能性考虑

- 资源占用：渲染进程只有一张图 + 一个音频实例，空闲时接近零开销
- 跨平台：Windows 优先验证；macOS 需注意 `alwaysOnTop` 层级与权限
- 安全：`contextIsolation` 开启，渲染进程不持有 Node 能力
