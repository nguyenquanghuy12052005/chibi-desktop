// Mỗi XState state → 1 tên animation trong skin.json
// Khi thêm state mới: chỉ sửa file này + skin.json + machine
export const CHIBI_ANIM_BY_STATE = {
  IDLE: 'idle',
  RUN: 'run',
  DRAG_CONFUSED: 'drag_confused',
  ALERT: 'alert',
  THINKING: 'thinking',
  SUCCESS: 'success',
  FAILED: 'failed',
  REST: 'rest',
}