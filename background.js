let collection = []

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

const getLocalStorage = window.getLocalStorage = () => {
  const temp = window.localStorage['MODIFY_R']
  collection = temp ? JSON.parse(temp) : []
}

function getLocalFileUrl(url) {
  var arr = url.split('.');
  var type = arr[arr.length-1];
  var xhr = new XMLHttpRequest();
  xhr.open('get', url, false);
  xhr.send(null);
  var content = xhr.responseText || xhr.responseXML;
  if (!content) {
      return false;
  }
  content = encodeURIComponent(
      type === 'js' ?
      content.replace(/[\u0080-\uffff]/g, function($0) {
          var str = $0.charCodeAt(0).toString(16);
          return "\\u" + '00000'.substr(0, 4 - str.length) + str;
      }) : content
  );
  return ("data:" + (typeMap[type] || typeMap.txt) + ";charset=utf-8," + content);
}

const typeMap = {
  "txt"   : "text/plain",
  "html"  : "text/html",
  "css"   : "text/css",
  "js"    : "text/javascript",
  "json"  : "text/json",
  "xml"   : "text/xml",
  "jpg"   : "image/jpeg",
  "gif"   : "image/gif",
  "png"   : "image/png",
  "webp"  : "image/webp"
}

chrome.webRequest.onBeforeRequest.addListener((detail) => {
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
  } = detail
  console.log('collection', collection)
  let newUrl = url
  for (let i = 0, len = collection.length; i < len; i++) {
    if (!collection[i].groupId) continue

    if (!collection[i].request.length) continue
    
    let reg = new RegExp(collection[i].request, 'gi');
    console.log(reg)
    if (collection[i].enabled && typeof collection[i].request === 'string' && reg.test(url)) {
      console.log('debug 11111')
      if (!/^file:\/\//.test(collection[i].request)) {
        console.log('debug 22222', collection[i].response)
        do {
          newUrl = newUrl.replace(reg, collection[i].response);
          console.log('debug 44444', newUrl)
        } while (reg.test(newUrl))
      } else {
        console.log('debug 33333')
        do {
          newUrl = getLocalFileUrl(newUrl.replace(reg, collection[i].response));
        } while (reg.test(newUrl))
      }
    }
  }
  console.log('newUrl', newUrl)
  return url === newUrl ? {} : { redirectUrl: newUrl }
  
}, { urls: ['<all_urls>'] }, ['blocking'])

getLocalStorage()