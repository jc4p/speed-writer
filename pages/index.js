import React, { useState, useEffect, useRef } from "react";

export default function Home() {
  const [ticks, setTicks] = useState(0)
  const [needsReset, setNeedsReset] = useState(false)
  const [needsPause, setNeedsPause] = useState(false)
  const clickEvents = useRef([])
  const clickEventsInWindow = useRef([])
  const lastWindowWPM = useRef(0)

  let updateIntervalId = useRef(0)
  let pauseIntervalId = useRef(0)
  
  const padTwoDigits = (num) => { return num < 10 ? `0${num}` : `${num}` }

  function getClickCount(onlyInWindow) {
    if (onlyInWindow) {
      return clickEventsInWindow.current.length
    }

    return clickEvents.current.length
  }
  
  const getDuration = () => {
    const ticksSeconds = Math.floor(ticks / 100)
    const minutes = Math.floor(ticksSeconds / 60)
    const seconds = minutes > 0 ? ticksSeconds - (minutes * 60) : ticksSeconds
    return `${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`
  }

  const getAvgWPM = () => {
    const clickCount = getClickCount()
    if (clickCount === 0) { return 0 }
    if (clickCount < 5) { return 0 }

    const tickSeconds = Math.floor(ticks / 100)
    return Math.round((clickCount / 5) / (tickSeconds / 60))
  }

  const getRealtimeWPM = () => {
    const clickCount = getClickCount(true)
    if (clickCount === 0) { return lastWindowWPM.current }

    // width in seconds
    const windowDuration = 2

    const wpm = Math.round((clickCount / 5) / (windowDuration / 60))
    lastWindowWPM.current = wpm

    return wpm
  }
  
  const getWPMText = () => {
    return (
      <div className="wpmRows">
        <span>{`${getAvgWPM()} AVG`}</span>
        <span>{`${getRealtimeWPM() }`}</span>
      </div>
    )
  }

  const onTextInput = (e) => {
    const fullText = e.target.value
    const thisChar = e.nativeEvent.data
    const now = Date.now()

    if (fullText === thisChar) {
      console.log('need to reset')
      setNeedsReset(true)
    } else {
      // character entry, if we're paused start back up
      if (needsPause) {
        console.log('need to resume')
        setNeedsPause(false)
      }
    }

    clickEvents.current.push({
      event: e.nativeEvent,
      time: now
    })

    // the minus here is the window width in ms
    const windowStart = now - 2000
    clickEventsInWindow.current = clickEvents.current.filter(f => f.time >= windowStart)

    if (pauseIntervalId.current) {
      clearTimeout(pauseIntervalId.current)
    }

    pauseIntervalId.current = setTimeout(() => {
      console.log('need to pause')
      setNeedsPause(true)
      pauseIntervalId.current = null
    }, 900)
  }
  
  const textUpdate = (e) => {
    //setChars(e.target.value.length)
  }
  
  useEffect(() => {
    if (needsReset) {
      if (updateIntervalId.current) {
        clearInterval(updateIntervalId.current)
      }

      clickEvents.current = []
      setTicks(1)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      updateIntervalId.current = setInterval(() => {
       setTicks(ticks => ticks + 1)
      }, 10)
      setNeedsReset(false)
    }

    if (needsPause) {
      clearInterval(updateIntervalId.current)
      updateIntervalId.current = null
    } else if (!needsPause) {
      if (!updateIntervalId.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        updateIntervalId.current = setInterval(() => {
          setTicks(ticks => ticks + 1)
        }, 10)
      }
    }
  }, [needsReset, needsPause])

  return (
    <main role="main" className="wrapper">
      <div className="content">
        <div className="innerContent">
          <div className="resultsContainer">
            <div className="resultBox">
              <h4>CHARS</h4>
              <div className="resultRow">
                <span>{getClickCount()}</span>
              </div>
            </div>
            <div className="resultBox">
              <h4>TIME</h4>
              <div className="resultRow">
              <span>{getDuration()}</span>
              </div>
            </div>
            <div className="resultBox">
              <h4>WPM</h4>
              {getWPMText()}
            </div>
          </div>
          <div className="inputContainer">
            <textarea onChange={e => textUpdate(e)} onInput={e => onTextInput(e)}></textarea>
          </div>
        </div>
      </div>
    </main>
  );
}
