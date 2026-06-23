import { createMachine } from 'xstate'

export const chibiMachine = createMachine({
  id: 'chibi',
  initial: 'IDLE',
  states: {
    IDLE: {
      on: { ALERT: 'ALERT' }
    },
    ALERT: {
      on: {
        THINK: 'THINKING',
        BACK: 'IDLE'
      }
    },
    THINKING: {
      on: {
        SUCCESS: 'SUCCESS',
        FAILED: 'FAILED'
      }
    },
    SUCCESS: {
      after: { 3000: 'IDLE' }   // auto transition sau 3s
    },
    FAILED: {
      after: { 3000: 'IDLE' }
    }
  }
})