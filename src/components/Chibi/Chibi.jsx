import SpeechBubble from '../SpeechBubble/SpeechBubble'

const GIF_MAP = {
  IDLE:     '/na.jpg',
  ALERT:    '/login.jpg',
  THINKING: '/dog.jpg',
  SUCCESS:  '/login5.jpg',
  FAILED:   '/login6.jpg',
}

export default function Chibi({ chibiRef, state, send, onMouseEnter, onMouseLeave }) {
  return (
    <div className="chibi-wrapper">
      <img
        ref={chibiRef}
        src={GIF_MAP[state]}
        alt="chibi"
        draggable={false}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          width: 120,
          height: 120,
          cursor: 'pointer',
          userSelect: 'none',
          WebkitAppRegion: 'drag'  // cho phép kéo cửa sổ
        }}
      />
      <SpeechBubble state={state} send={send} />
    </div>
  )
}