import { createMachine } from 'xstate'

export const chibiMachine = createMachine({
  id: 'chibi',
  initial: 'IDLE',
  states: {
    IDLE: {
      //idle gọi all
      on: {
        RUN: 'RUN',
        DRAG_CONFUSED: 'DRAG_CONFUSED',
        ALERT: 'ALERT',
        THINKING: 'THINKING',
        SUCCESS: 'SUCCESS',
        FAILED: 'FAILED',
        REST: 'REST',
      },
    },
      
    RUN: { on: { IDLE: 'IDLE', REST: 'REST', ALERT: 'ALERT' } }, //chạy gọi nghỉ, hỏi
    DRAG_CONFUSED: { on: { IDLE: 'IDLE', REST: 'REST' } },

    ALERT: { on: { THINKING: 'THINKING', IDLE: 'IDLE' } },
    THINKING: { on: { SUCCESS: 'SUCCESS', FAILED: 'FAILED', IDLE: 'IDLE' } },

    SUCCESS: { after: { 2000: 'IDLE' }, on: { IDLE: 'IDLE' } },
    FAILED: { after: { 2000: 'IDLE' }, on: { IDLE: 'IDLE' } },

    REST: { on: { IDLE: 'IDLE', ALERT: 'ALERT', RUN: 'RUN' } },
  },
})