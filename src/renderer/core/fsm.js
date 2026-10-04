// 有限状态机：IDLE / HOVER / DRAG / TALK / SLEEP
import { bus } from './event-bus.js';

export const State = Object.freeze({
  IDLE: 'IDLE', HOVER: 'HOVER', DRAG: 'DRAG', TALK: 'TALK', SLEEP: 'SLEEP',
});

class PetFSM {
  #state = State.IDLE;
  #idleTimer = null;

  get state() { return this.#state; }

  transition(to, payload = {}) {
    if (to === this.#state) return;
    bus.emit('state:exit', { from: this.#state });
    this.#state = to;
    bus.emit('state:enter', { state: to, ...payload });
    this.#resetSleepTimer();
  }

  // 30 秒无交互进入 SLEEP
  #resetSleepTimer() {
    clearTimeout(this.#idleTimer);
    if (this.#state !== State.SLEEP) {
      this.#idleTimer = setTimeout(() => this.transition(State.SLEEP), 30_000);
    }
  }
}

export const fsm = new PetFSM();
