# otto-desk-pet 说的道理桌宠

以「说的道理」为形象的桌面宠物，基于 Electron 实现。

## 初版目标（v0.1）

- 透明无边框桌面窗口，置顶显示，鼠标可穿透空白区域
- 基础互动：拖拽、点击、悬停反馈
- 语音包系统：按事件触发语音，支持自定义语音包热加载

## 技术栈

- **Electron**（主进程管窗口 / 托盘 / 系统能力，渲染进程管表现与交互）
- 渲染层纯 HTML/CSS/JS，零框架依赖，后续可按需引入
- 音频播放基于 HTMLAudio，语音包以 JSON 清单描述

## 快速开始

```bash
npm install
npm start
```

## 文档

- [架构设计](docs/ARCHITECTURE.md)
- [语音包格式规范](docs/VOICEPACK.md)

## 目录结构

```
├── docs/                 # 架构与规范文档
├── assets/               # 桌宠形象图片等资源
├── voicepacks/           # 语音包（每个子目录一个语音包）
└── src/
    ├── main/             # Electron 主进程：窗口、托盘、IPC
    ├── preload/          # 预加载脚本：安全桥接
    └── renderer/         # 渲染进程：状态机、交互、音频
```
