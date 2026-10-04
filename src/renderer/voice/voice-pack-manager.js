// 语音包管理器：加载 pack.json，按 trigger 加权随机选语音
// 说明：出于骨架简化，当前内置默认包；正式版由主进程扫描 voicepacks/ 后经 IPC 下发
import { bus } from '../core/event-bus.js';

const EVENT_TO_TRIGGER = {
  'ui:click': 'on_click',
  'ui:drag-start': 'on_drag_start',
  'ui:drag-end': 'on_drag_end',
  'ui:hover': 'on_hover',
  'app:start': 'on_startup',
  'state:enter:SLEEP-exit': 'on_idle',
};

const COOLDOWN_MS = { on_click: 3000, on_idle: 30000, default: 1500 };
const PRIORITY = { on_click: 2, on_idle: 1, default: 1 };

class VoicePackManager {
  #pack = null;            // 当前语音包 manifest
  #lastPlayedAt = {};      // trigger -> timestamp

  async loadDefault() {
    // TODO: 改为经 IPC 从主进程获取用户选中的语音包
    this.#pack = await (await fetch('../../voicepacks/jingdian/pack.json')).json();
    bus.emit('voice:loaded', { name: this.#pack.name });
    this.#bindEvents();
  }

  #bindEvents() {
    for (const [event, trigger] of Object.entries(EVENT_TO_TRIGGER)) {
      bus.on(event, () => this.#play(trigger));
    }
  }

  #pick(trigger) {
    const list = this.#pack?.triggers?.[trigger] ?? [];
    if (!list.length) return null;
    const total = list.reduce((s, it) => s + (it.weight ?? 1), 0);
    let r = Math.random() * total;
    for (const item of list) {
      r -= item.weight ?? 1;
      if (r <= 0) return item;
    }
    return list[0];
  }

  #play(trigger) {
    const now = Date.now();
    const cd = COOLDOWN_MS[trigger] ?? COOLDOWN_MS.default;
    if (now - (this.#lastPlayedAt[trigger] ?? 0) < cd) return;

    const item = this.#pick(trigger);
    if (!item) return;
    this.#lastPlayedAt[trigger] = now;

    bus.emit('voice:play', {
      src: `../../voicepacks/jingdian/${item.file}`,
      text: item.text ?? '',
      priority: PRIORITY[trigger] ?? PRIORITY.default,
    });
  }
}

export const voicePacks = new VoicePackManager();
