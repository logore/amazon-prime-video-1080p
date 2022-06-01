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

const main = async () => {
  injectScript(() => {
    window.__defineGetter__('innerWidth', () => 1920)
    window.__defineGetter__('innerHeight', () => 1080)
    document.documentElement.__defineGetter__('clientWidth', () => 1920)
    document.documentElement.__defineGetter__('clientHeight', ()=> 1080)  
  })
}

main()