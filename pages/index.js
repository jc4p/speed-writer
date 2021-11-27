import React, { useState, useEffect, useRef } from "react";

export default function Home() {
  const [ticks, setTicks] = useState(0)
  const [needsReset, setNeedsReset] = useState(false)
  const clickEvents = useRef([])
  const latestRollingCount = useRef(0)
  const lastEventsLength = useRef(0)

  let updateInterval;
  
  const padTwoDigits = (num) => { return num < 10 ? `0${num}` : `${num}` }

  function getClickCount() {
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
    const clickCount = clickEvents.current.length
    if (clickCount === 0) { return 0 }

    // find click events within a time window of [-3s, now]
    const windowMs = 2000
    const now = Date.now()
    const windowStart = now - windowMs
    let firstItem = -1
    let lastItem = -1

    for (let i = 0; i < clickEvents.current.length; i++) {
      const time = clickEvents.current[i].time
      if (firstItem == -1 && time >= windowStart) {
        firstItem = i
      }
      else if (time <= now) {
        lastItem = i
      }
    }

    if (lastItem == -1) {
      lastItem = clickEvents.current.length
    }

    if (firstItem < 0) {
      if (lastItem > 0) {
        return `PAUSED`
      }

      return 0
    }
    if (lastItem < 2) {
      return latestRollingCount.current
    }

    const rollingItems = clickEvents.current.slice(firstItem, lastItem)
    if (rollingItems.length === 0) {
      return `PAUSED`
    }

    const deltaStart = rollingItems[0].time
    const lastEntry = rollingItems[rollingItems.length - 1]
    const diffMs = lastEntry.time - deltaStart
    const diffSeconds = diffMs / 1000
    const diffMinutes = diffSeconds / 60
    //console.log(`Typed ${rollingItems.length} chars in ${diffSeconds}s / ${diffMinutes}m, ${Math.ceil(rollingItems.length / 5)}`)
    const wpm = Math.round(Math.ceil(rollingItems.length / 5) / diffMinutes)
    latestRollingCount.current = wpm
    lastEventsLength.current = clickEvents.current.length

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
    if (fullText === thisChar) {
      console.log('need to reset')
      setNeedsReset(true)
    }

    clickEvents.current.push({
      event: e.nativeEvent,
      time: Date.now()
    })
  }
  
  const textUpdate = (e) => {
    //setChars(e.target.value.length)
  }
  
  useEffect(() => {
    if (needsReset) {
      if (updateInterval) {
        clearInterval(updateInterval)
      }

      clickEvents.current = []
      setTicks(1)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      updateInterval = setInterval(() => {
       setTicks(ticks => ticks + 1)
      }, 10)
      setNeedsReset(false)
    }
  }, [needsReset])

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
