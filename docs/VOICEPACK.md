# 语音包格式规范

一个语音包 = 一个目录，包含 `pack.json` 清单与音频文件：

```
voicepacks/
└── jingdian/               # 语音包目录名即包 id
    ├── pack.json
    └── sounds/
        ├── wo-cao.mp3
        └── ni-gan-ma.mp3
```

## pack.json

```json
{
  "name": "经典语音包",
  "version": "1.0.0",
  "author": "your-name",
  "triggers": {
    "on_startup":    [{ "file": "sounds/a.mp3", "weight": 1, "text": "字幕文字" }],
    "on_click":      [{ "file": "sounds/b.mp3", "weight": 3, "text": "..." }],
    "on_drag_start": [],
    "on_drag_end":   [],
    "on_hover":      [],
    "on_idle":       []
  }
}
```

## 字段说明

- `triggers`：事件名 → 候选语音数组。事件名与 FSM/交互事件一一对应，
  初版支持以上 6 个；数组为空表示该事件不发声
- `file`：相对语音包根目录的音频路径，支持 mp3 / wav / ogg
- `weight`：加权随机权重，缺省为 1
- `text`：可选，播放时同步显示的气泡字幕

## 运行时行为

- 同一 trigger 默认冷却 3 秒（`on_idle` 为 30 秒），防止语音轰炸
- `on_click` 优先级高于 `on_idle`：闲聊中被打断时直接切到点击语音
- 修改 `pack.json` 或增删音频后自动热加载，无需重启应用
