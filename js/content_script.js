const injectScript = fn => {
  if (typeof fn !== 'function') {
    return
  }

  let match = fn.toString().match(/{.*}/sm)
  let fnStr = match[0].slice(1, match[0].length - 1)

  document.documentElement.setAttribute('onreset', fnStr)
  document.documentElement.dispatchEvent(new CustomEvent('reset'))
  document.documentElement.removeAttribute('onreset')
}

const main = () => {
  injectScript(() => {
    (async() => {
      const sleep = ms => new Promise(r => setTimeout(r, ms))

      for(;;) {
        if (document.documentElement !== null && document.body !== null) {
          break
        }
        await sleep(100)
      }
      
      const startXHRHooking = () => {
        let script = document.createElement('script')
        script.src = '//unpkg.com/xhook@latest/dist/xhook.min.js'

        document.body.appendChild(script)
        script.remove()

        script.addEventListener('load', () => {
          xhook.after(function(request, response) {
            try {
              if (request.url.match(/\.mpd/)) {
                let mpd = response.text

                const parser = new DOMParser()
                const dom = parser.parseFromString(mpd, 'text/xml')
    
                let periods = dom.querySelectorAll('Period')

                let periodIndex = periods.length == 1 ? 0 : 1
                let period = periods[periodIndex]
                let representations = period.querySelectorAll('AdaptationSet[contentType="video"] > Representation')

                let heights = []
                let bandwidths = []
                let ids = []
              
                representations.forEach(rep => {
                  heights.push(parseInt(rep.getAttribute('height'), 10))
                  bandwidths.push(parseInt(rep.getAttribute('bandwidth'), 10))

                  ids.push(rep.getAttribute('id'))
                })

                // sort by largest number
                heights = Array.from(new Set(heights))
                heights.sort((a, b) => b - a)

                // sort by largest number
                bandwidths = Array.from(new Set(bandwidths))
                bandwidths.sort((a, b) => b - a)

                ids.forEach((id, i) => {
                  if (!(representations[i].getAttribute('height') == heights[0].toString() && representations[i].getAttribute('bandwidth') == bandwidths[0].toString())) {
                    // there may be multiple Representations with a height of 1080, so maybe there should be an option to allow the user to choose those.
                    // the maximum bandwidth will cause the file size to be large, so it will be overloaded.

                    // delete other representation elements
                    dom.querySelectorAll('Period')[periodIndex].querySelector(`AdaptationSet[contentType="video"] > Representation[id="${id}"`).remove()
                  }
                })

                // revert the edited mpd xml to plain mpd
                let mpd_ = dom.documentElement.outerHTML
      
                response.text = mpd_
              }
            } catch(error) {
              console.error(error)
            }
          })
        })
      }
      
      startXHRHooking()
      
      const div = document.createElement('div')
      div.classList.add('anim-box')
      div.classList.add('popup')

      document.body.appendChild(div)
    })()
  })
}

main()