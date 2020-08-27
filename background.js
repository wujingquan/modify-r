function log (...args) {
  console.log(`this message from extension 'Modify R'`, ...args)
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

chrome.webRequest.onBeforeRequest.addListener((details) => {
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

}, { urls: ['<all_urls>'] }, ['blocking'])