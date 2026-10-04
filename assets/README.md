# assets

桌宠形象资源：

- `pet.png`：静态形象，512×512 透明背景 PNG（用于 SLEEP 状态）
- `pet_anim.apng`：待机动画，384×384 × 132 帧 APNG（已去绿边、统一画布）
- `pet.ico`：应用与快捷方式图标（16~256 多尺寸）

> 以上二进制文件需从交付物复制到本目录（未入库）。

## 动画说明

- APNG 与 GIF 一样是逐帧动画，但支持完整 alpha 通道，边缘平滑无锯齿，
  Chromium / Electron 原生支持，直接 `<img>` 引用即可循环播放
- 后续可按状态拆分多段动画（如 `pet_talk.apng` 说话、`pet_drag.apng` 被拖），
  在 `pet.js` 的 `state:enter` 监听里按状态切换 `src` 即可
