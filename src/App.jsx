import { useRef, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import { chibiMachine } from '../machines/chibi.machine'
import Chibi from './components/Chibi/Chibi'

export default function App() {

  const [state, send] = useMachine(chibiMachine)
  const currentState = state.value  // 'IDLE' | 'ALERT' | 'THINKING' | 'SUCCESS' | 'FAILED'


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

  // const handleMouseEnter = () => {
  //   window.electronAPI?.mouseEnter()  // bật tương tác chuột
  // }

  // const handleMouseLeave = () => {
  //   window.electronAPI?.mouseLeave()  // tắt → click-through
  // }


  return (
    <div style={{ width: '100vw', height: '100vh', background: 'transparent' }}>
      <Chibi state={currentState} />
    </div>
  )
}