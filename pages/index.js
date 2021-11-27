import React, { useState, useEffect } from "react";

// Home function that is reflected across the site
export default function Home() {
  const [ticks, setTicks] = useState(0)
  const [chars, setChars] = useState(0)
  const [needsReset, setNeedsReset] = useState(false)
  const padTwoDigits = (num) => { return num < 10 ? `0${num}` : `${num}` }

  let updateInterval;
  
  const getDuration = () => {
    const minutes = Math.floor(ticks / 60)
    const seconds = minutes > 0 ? ticks - (minutes * 60) : ticks
    return `${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`
  }
  
  const getWPM = () => {
    if (chars === 0) { return 0 }
    // (chars / 5) normalizes at 5 chars per word
    const rawVal = (chars / 5) / (ticks / 60)
    return Math.round(rawVal)
  }

  const onTextInput = (e) => {
    const fullText = e.target.value
    const thisChar = e.nativeEvent.data
    if (fullText === thisChar) {
      console.log('need to reset')
      setNeedsReset(true)
    }
  }
  
  const textUpdate = (e) => {
    setChars(e.target.value.length)
  }
  
  useEffect(() => {
    if (needsReset) {
      if (updateInterval) {
        clearInterval(updateInterval)
      }

      setTicks(1)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      updateInterval = setInterval(() => {
       setTicks(ticks => ticks + 1)
      }, 1000)
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
              <span>{chars}</span>
            </div>
            <div className="resultBox">
              <h4>TIME</h4>
              <span>{getDuration()}</span>
            </div>
            <div className="resultBox">
              <h4>WPM</h4>
              <span>{getWPM()}</span>
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
