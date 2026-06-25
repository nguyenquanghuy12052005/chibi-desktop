import { useRef, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import { chibiMachine } from '../machines/chibi.machine'
import Chibi from './components/Chibi/Chibi'

export default function App() {

  const [state, send] = useMachine(chibiMachine)
  const currentState = state.value  // 'IDLE' | 'ALERT' | 'THINKING' | 'SUCCESS' | 'FAILED'
  const NEUTRAL_STATES = ['IDLE', 'RUN', 'REST'];

  function pickRandomNeutral() {
    const i = Math.floor(Math.random() * NEUTRAL_STATES.length);
    return NEUTRAL_STATES[i];
  }

  // Nhận state từ Electron main → đẩy vào XState
  useEffect(() => {
    const api = window.electronAPI
    if (!api?.onChibiState) return
    const handler = ({ state: nextState }) => {
      console.log('[renderer] nhận CHIBI_STATE:', nextState)
      send({ type: nextState })
    }
    api.onChibiState(handler)
    return () => api.removeChibiStateListener?.()
  }, [send])


useEffect(() => {
  const id = setInterval(() => {
    const current = state.value;
    if (!NEUTRAL_STATES.includes(current)) return;
    send({ type: pickRandomNeutral() });
  }, 5000);
  return () => clearInterval(id);
}, [state.value, send]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'transparent' }}>
      <Chibi state={currentState} />
    </div>
  )
}