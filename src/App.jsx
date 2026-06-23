import { useRef, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import { chibiMachine } from '../machines/chibi.machine'
import Chibi from './components/Chibi/Chibi'

export default function App() {
  const chibiRef = useRef(null)
  const [state, send] = useMachine(chibiMachine)
  const currentState = state.value  // 'IDLE' | 'ALERT' | 'THINKING' | 'SUCCESS' | 'FAILED'

  // Lắng nghe IPC từ Electron main process
  // window.electronAPI chỉ có trong Electron, không có trong browser thường
  useEffect(() => {
    const api = window.electronAPI;

   if (api?.onChibiState) {
    api.onChibiState(({ state }) => {
      send({ type: state });   
    });
  }
    if (api?.removeChibiStateListener) {
      api.removeChibiStateListener();
    }
  }, [send]);

  const handleMouseEnter = () => {
    window.electronAPI?.mouseEnter()  // bật tương tác chuột
  }

  const handleMouseLeave = () => {
    window.electronAPI?.mouseLeave()  // tắt → click-through
  }

  return (
    // Toàn bộ app background trong suốt
    <div style={{ width: '100vw', height: '100vh', background: 'transparent' }}>
      <Chibi
        chibiRef={chibiRef}
        state={currentState}
        send={send}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}