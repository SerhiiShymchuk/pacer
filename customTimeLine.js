
Date.customTimeline = function ({
    current = new Date('Oct 21 2015 04:29 pm'), // 'Back to the Future' Day
    updInterval = 77, 
    speed = 1,
    running = true
  } = {}) {
  
    current = +current
  
    let stickMoment, stickPoint
    let updTimer = 0
    let updCount = 0
  
    // reset the point to measure the time from it
    const stickNow = () => {
      stickMoment = Date.now()
      stickPoint = current
    }
  
    const update = () => {
      const now = Date.now()
      current = stickPoint + (now - stickMoment) * speed
      timeline.dispatchEvent( new CustomEvent('update', {detail: timeline.now}) )
      return ++updCount
    }
  
    const shift = (diff) => {
      if (typeof diff != 'number')  return false
      current += diff
      stickNow()
      
      if (running)  run()
      else  update()
      return current
    }
  
    const run = () => {
      if (!running)  stickNow()
      update()
      clearInterval(updTimer)
      updTimer = setInterval(update, updInterval)
      timeline.dispatchEvent( new Event('run') )
      running = true
    }
  
    const freeze = () => {
      if (running) {
        update()
        clearInterval(updTimer)
        stickNow()
        running = false
        timeline.dispatchEvent( new Event('freeze') )
      }
    }
  
    const timeline = new EventTarget
  
    Object.assign(timeline, {update, shift, run, freeze})
  
    Object.defineProperties(timeline, {
      now: {
        get: () => new Date(current),
        set(date) {
          current = +date
          stickNow()
          if (running)  run()
          else  update()
          return date
        }
      },
  
      updInterval: {
        get: () => updInterval,
        set(interval) {
          clearInterval(updTimer)
          updInterval = interval
          if (running)  run()
          return interval
        }
      },
  
      speed: {
        get: () => speed,
        set(multiplier) {
          clearInterval(updTimer)
          speed = multiplier
          stickNow()
          if (running)  run()
          return multiplier
        }
      },
  
      updCount: {
        get: () => updCount,
        set: count => updCount = count
      },
  
      running: {
        get: () => running
      }
    })
  
    stickNow()
    if (running)  run()
  
    return timeline
  }
tl = Date.customTimeline({current: new Date(2020,9,19)}) 

DateOriginal = Date
Date = function Date(...args) {
    return args.length ? new DateOriginal(...args) : tl.now
}
Object.setPrototypeOf(Date, DateOriginal)