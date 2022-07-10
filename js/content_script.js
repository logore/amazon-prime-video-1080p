const injectScript = (fn) => {
  if(typeof fn !== 'function') {
    return;
  }
  let match = fn.toString().match(/{.*}/sm);
  let fnStr = match[0].slice(1, match[0].length - 1);

  document.documentElement.setAttribute('onreset', fnStr);
  document.documentElement.dispatchEvent(new CustomEvent('reset'));
  document.documentElement.removeAttribute('onreset');
}

const main = () => {
  injectScript(() => {
    (async() => {
      const sleep = ms => new Promise(r => setTimeout(r, ms))

      for(;;) {
        if(document.documentElement !== null && document.body !== null) {
          break
        }
        await sleep(100)
      }

      window.__defineGetter__('innerWidth', () => 1920)
      window.__defineGetter__('innerHeight', () => 1080)
      document.documentElement.__defineGetter__('clientWidth', () => 1920)
      document.documentElement.__defineGetter__('clientHeight', ()=> 1080)
  
      const div = document.createElement('div')
      div.classList.add('anim-box')
      div.classList.add('popup')

      document.body.appendChild(div)
    })();
  })
}

main()