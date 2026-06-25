import { useEffect, useRef } from 'react';

const MESSAGES = {
  IDLE:     null,                     // ẩn bubble lúc idle
  ALERT:    '1',
  THINKING: '2',
  SUCCESS:  '3',
  FAILED:   '4',
};

export default function SpeechBubble({ state, send }) {
  const msg = MESSAGES[state];
  const eventIndex = useRef(0);
  const eventSequence = ['ALERT', 'THINK', 'SUCCESS', 'FAILED', 'IDLE']; // vòng lặp 3 event

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const eventType = eventSequence[eventIndex.current % eventSequence.length];
  //     send({ type: eventType });
  //     eventIndex.current += 1;
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [send]);


}