// 渲染进程入口：装配各模块，绑定交互
import { bus } from './core/event-bus.js';
import { fsm, State } from './core/fsm.js';
import { voicePacks } from './voice/voice-pack-manager.js';
import './voice/audio-engine.js';

const pet = document.getElementById('pet');
const bubble = document.getElementById('bubble');

// ── 鼠标穿透切换：悬停在形象上时窗口才接管鼠标 ──
pet.addEventListener('mouseenter', () => {
  window.petBridge.setInteractive(true);
  fsm.transition(State.HOVER);
  bus.emit('ui:hover');
});
pet.addEventListener('mouseleave', () => {
  window.petBridge.setInteractive(false);
  if (fsm.state !== State.DRAG) fsm.transition(State.IDLE);
});

// ── 点击 / 拖拽 ──
let dragging = false, last = null, moved = false;

pet.addEventListener('mousedown', (e) => {
  dragging = true; moved = false;
  last = { x: e.screenX, y: e.screenY };
  fsm.transition(State.DRAG);
  bus.emit('ui:drag-start');
});

window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  moved = true;
  window.petBridge.moveBy(e.screenX - last.x, e.screenY - last.y);
  last = { x: e.screenX, y: e.screenY };
});

window.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  bus.emit('ui:drag-end');
  if (!moved) {                       // 未移动视为点击
    fsm.transition(State.TALK);
    bus.emit('ui:click');
  } else {
    fsm.transition(State.IDLE);
  }
});

// ── 状态 → 外观 ──
bus.on('state:enter', ({ state }) => {
  pet.classList.toggle('hover', state === State.HOVER);
  pet.classList.toggle('sleep', state === State.SLEEP);
  if (state === State.SLEEP) bus.emit('state:enter:SLEEP-exit'); // 占位：正式版用专门 idle 触发器
});

// 语音播完回到 IDLE
bus.on('voice:end', () => { if (fsm.state === State.TALK) fsm.transition(State.IDLE); });

// 气泡字幕
bus.on('ui:bubble', ({ text }) => {
  bubble.textContent = text;
  bubble.style.display = 'block';
  setTimeout(() => (bubble.style.display = 'none'), 2500);
});

// ── 启动 ──
voicePacks.loadDefault().then(() => bus.emit('app:start'));
