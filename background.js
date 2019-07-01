let collections = [
  {
    req: '',
    res: '',
    type: 'js',
    path: 'https://cdn.bootcss.com/vue/2.6.10/vue.min.js',
  }
]

function log (message) {
  console.log(`this message from extension 'Modify R'`, message)
}

function getTabId (cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    cb && typeof cb === 'function' && cb(tabs.length ? tabs[0].id : null)
  })
}

function injectJS ({ tabId } = {}) {
  chrome.tabs.executeScript(tabId, { code: code })
}

function injectCSS ({ tabId } = {}) {
  chrome.tabs.executeScript(tabId, { code: code })
}

chrome.webRequest.onBeforeRequest.addListener(details => {
  const {
    url,
    frameId,
    initiator,
    method,
    parentFrameId,
    requestId,
    tabId,
    timeStamp,
    type,
  } = details

  log(details)
  log(window.localStorage.MODIFY_R)

  // if (url.includes('wujingquan.com')) {
  //   let code = `console.log('debug')
  //   el = document.createElement('script')
  //   el.setAttribute('type', 'text/javascript')
  //   el.src = 'https://cdn.bootcss.com/vue/2.6.10/vue.min.js'
  //   document.head.appendChild(el)`

  //   chrome.tabs.executeScript(getTabId(), { code: code })
  // }

  
  // if (item.type === 'js') {
  //   injectJS({
  //     tabId,
  //     path
  //   })
  // }
  
  // if (item.type === 'css') {
  //   injectCSS({
  //     tabId,
  //     path
  //   })
  // }

  // if (['main_frame'].includes(type)) {

  // }

  // let item = collections.find(item => {
  //   return item && item.checked
  // })
  // if (item) {
    
  // }


}, { urls: ['<all_urls>'] }, ['blocking'])