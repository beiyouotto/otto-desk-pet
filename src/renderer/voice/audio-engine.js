// 音频引擎：单实例播放 + 优先级打断
import { bus } from '../core/event-bus.js';

class AudioEngine {
  #audio = new Audio();
  #currentPriority = 0;

  constructor() {
    this.#audio.addEventListener('ended', () => {
      this.#currentPriority = 0;
      bus.emit('voice:end');
    });
    bus.on('voice:play', ({ src, text, priority }) => this.play(src, text, priority));
  }

  play(src, text, priority = 1) {
    // 低优先级不能打断正在播放的高优先级语音
    if (!this.#audio.paused && priority < this.#currentPriority) return;
    this.#currentPriority = priority;
    this.#audio.src = src;
    this.#audio.play().catch(() => bus.emit('voice:end'));
    if (text) bus.emit('ui:bubble', { text });
  }
}

export const audioEngine = new AudioEngine();
