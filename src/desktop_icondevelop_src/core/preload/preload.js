const classifiedOnCallbacks = {}
const classifiedCallbacks = {}
const frontendPublicMethods = {}
const config = {}
const config_base = {}
let debug_send_event = true
let debug_recieve_event = true
let debug_recieve_execute_event = true

class Main {
  cids = []

  change_data_token = `data-change`
  loadBaseSentinel = false
  lsSentinelloadBase = null
  webSocket = null
  webSocketMessageQueue = [];

  constructor() { }

  main() {
    this.startWebsocket()
    this.getBaseConf()
    this.loadPageBaseJS()
    this.autoExecAfterByLoaded()
    this.registerClickHandlers();
    this.addEventListenerAllConfig();
  }

  getwsUrl() {
    return `ws://localhost:${window.location.port}/ws`
  }

  startWebsocket(callback) {
    let wsUrl = this.getwsUrl()
    console.log(`wsUrl ${wsUrl}`)
    if (!this.webSocket) {
      this.webSocket = new WebSocket(wsUrl);
      console.log(`webSocket ${this.webSocket}`)
      this.webSocket.onopen = (event) => {
        console.log('Connected to the WebSocket server.');
        if (callback) callback(true)
      };
      this.webSocket.onmessage = (event) => {
        let data = event.data
        try {
          if (typeof data === 'string') {
            data = JSON.parse(data)
          }
        } catch (e) {
          console.log(event)
          console.log(data)
          console.error(e)
        }
        this.websocketCallback(data, event)
      };
      this.webSocket.onerror = (event) => {
        console.error('WebSocket Error:', event);
        if (callback) callback(false)
      };

      this.webSocket.onclose = (event) => {
        this.webSocket = null
        if (callback) callback(false)
        console.log('WebSocket Connection Closed. Trying to reconnect...');
        setTimeout(() => {
          this.startWebsocket(callback)
        }, 10); // 1秒后尝试重新连接
      };
    }
  }

  websocketCallback(rData, event) {
    let cid = rData.cid ? rData.cid : rData.send_id
    let data = rData.data

    let rawData = rData.rawData
    if (debug_send_event === undefined) debug_send_event = rData.debug_send_event
    if (debug_recieve_event === undefined) debug_recieve_event = rData.debug_recieve_event
    if (debug_recieve_execute_event === undefined) debug_recieve_execute_event = rData.debug_recieve_execute_event
    let print_event = rData.event_name ? rData.event_name : rData.recieve_on
    let event_name = rData.event_name
    let recieve_on = rData.recieve_on
    let callbacks = this.getClassifiedCallbacks(cid, true)
    if (debug_recieve_event) {
      console.log(`\n\n-------------- ${print_event} of receive --------------`)
      console.log(`wsClientFingerprint`, rData.wsClientFingerprint)
      console.log(`cid :`, cid)
      console.log(`event_name :`, event_name)
      console.log(`recieve_on :`, recieve_on)
      console.log(`callbacks :`, callbacks)
      console.log(rData)
    }

    if (recieve_on) {
      this.execReceive(recieve_on, rData)
    }
    if (callbacks.length) {
      callbacks.forEach((callObject) => {
        let callback = callObject.func
        let index = callObject.index
        callback(rData)
      })
    }
  }

  setFrontendPublicMethods(k, v) {
    if (!frontendPublicMethods[k]) {
      frontendPublicMethods[k] = []
    }
    console.log(`setFrontendPublicMethods`)
    console.log(k, v)
    frontendPublicMethods[k].push(v)
  }

  getFrontendPublicMethods(k) {
    return frontendPublicMethods[k]
  }

  gFM(k) {
    return this.getFrontendPublicMethods(k)
  }

  getClassifiedOnCallbacks(key) {
    if (key) {
      if (classifiedOnCallbacks[key]) {
        return classifiedOnCallbacks[key]
      } else {
        return []
      }
    }
    return classifiedOnCallbacks
  }

  setClassifiedOnCallbacks(k, v) {
    if (k) {
      if (!classifiedOnCallbacks[k]) {
        classifiedOnCallbacks[k] = []
      }
      if (v) {
        classifiedOnCallbacks[k].push(v)
      }
    }
  }

  getClassifiedCallbacks(key, del = false) {
    if (key) {
      let result = classifiedCallbacks[key]
      if (del && result) {
        delete classifiedCallbacks[key]
      }
      if (result) {
        return result
      } else {
        return []
      }
    }
    return []
  }

  setClassifiedCallbacks(k, v) {
    if (k) {
      if (!classifiedCallbacks[k]) {
        classifiedCallbacks[k] = []
      }
      if (v) {
        classifiedCallbacks[k].push(v)
      }
    }
  }


  loadPageBaseJS() {
    let page_name = this.getPageName()
    console.log(`loadPageBaseJS`)
    this.classified_send(`htmlWidget:loadPageBaseJS`, page_name, (rData) => {
      console.log(`htmlWidget:loadPageBaseJS`)
      console.log(rData)
      this.initLoadBaseJS(rData.data)
    })
  }

  autoExecAfterByLoaded() {
    if (!this.loadBaseSentinel) {
      this.loadBaseSentinels = `nuan`
      let page_name = this.getPageName()
      this.classified_send(`htmlWidget:autoExecAfterByLoaded`, page_name)
    }
  }

  autoExecBeforeByLoaded() {
    if (!this.lsSentinelloadBase) {
      this.lsSentinelloadBase = `nuan`
      let page_name = this.getPageName()
      this.classified_send(`htmlWidget:autoExecBeforeByLoaded`, page_name)
    }
  }

  elementTokenToKey(element) {
    if (element.id) {
      return `#` + element.id;
    }
    if (element.getAttribute('name')) {
      return `[name="${element.getAttribute('name')}"]`
    }
    if (element.className) {
      return "." + element.className.split(/\s+/).join(' .');
    }
    return null;
  }

  getFileExtension(filePath) {
    return '.' + filePath.slice(((filePath.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  initLoadBaseJS(files) {
    files.forEach(ref => {
      const ext = this.getFileExtension(ref).toLowerCase();
      switch (ext) {
        case '.css':
          (() => {
            let hId = document.createElement('link');
            hId.rel = "stylesheet";
            hId.href = ref;
            document.head.appendChild(hId);
          })()
          break;
        case '.js':
          (() => {
            let hId = document.createElement('script');
            hId.src = ref;
            document.body.appendChild(hId);
          })()
          break;
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
        case '.webp':
          (() => {
            let hId = document.createElement('img');
            hId.src = ref;
            document.body.appendChild(hId);
          })()
          break;
        default:
          console.log(`Unsupported file type: ${ext}`);
      }
    });
  }

  addEventListenerAllConfig() {
    const elementsWithData = document.querySelectorAll(`[${this.change_data_token}]`);
    elementsWithData.forEach(element => {
      element.addEventListener('change', (event) => {
        let value;
        let value_type;
        let options = ``
        let selector = this.elementTokenToKey(element)
        switch (element.type) {
          case 'checkbox':
          case 'radio':
            value = element.checked;
            value_type = 'boolean';
            break;
          case 'select-one':
          case 'select-multiple':
            value = [...element.selectedOptions].map(option => option.value);
            options = [...element.selectedOptions]
            value_type = 'array';
            break;
          case 'file':
            value = [...element.files].map(file => file.name);
            value_type = 'text';
            break;
          case 'password':
            value = element.value;
            value_type = 'password';
            break;
          default:
            value = element.value;
            value_type = 'text';
            break;
        }
        this.save_config_cast_config(selector, value, value_type, options)
      });
    });
  }

  registerClickHandlers() {
    const pre_class = 'event-';
    const elements = document.querySelectorAll(`[class*="${pre_class}"]`);
    for (const element of elements) {
      let isclickevent = element.getAttribute('data-isclickevent')
      if (!isclickevent) {
        const classList = Array.from(element.classList);
        classList.forEach((classname) => {
          if (classname.startsWith(pre_class)) {
            classname = classname.split('-');
            if (classname.length < 3) {
              console.log(`Event ${classname} not registered.'classname.length < 3', Example: 'class=\"event-click(event_type)-event_name\"'`);
            } else {
              let event_type = classname[1];
              let event_name = classname[2];
              element.setAttribute('data-isclickevent', 'true')
              element.addEventListener(event_type, () => {
                this.classified_send(`cast_config:${event_name}`, element)
              });
              console.log(`Event ${event_type}:${event_name} registered successfully.`);
            }
          }
        });
      }
    }
  }

  getPageName() {
    let pagename = ``
    const lastPart = window.location.href.split('/').pop();
    if (!lastPart || !lastPart.includes('.')) {
      pagename = lastPart;
    }
    if (pagename) {
      const partsWithoutExtension = lastPart.split('.');
      partsWithoutExtension.pop();
      pagename = partsWithoutExtension.join('.')
    }
    pagename = pagename ? pagename : 'index'
    return pagename
  }

  classified_send(event_name, ...args) {
    let cid = this.generateCID(32)
    let [nArgs, callbackFunction] = this.extractFunctions(args)
    if (callbackFunction.length) {
      if (!classifiedCallbacks[cid]) {
        classifiedCallbacks[cid] = []
      }
      classifiedCallbacks[cid] = classifiedCallbacks[cid].concat(callbackFunction)
    }

    if (debug_send_event) {
      console.log(`------------ classified_send: ${event_name} ------------`)
      console.log(`event_name: ${event_name}`)
      console.log(`cid: ${cid}`)
      console.log(`callback: ${classifiedCallbacks[cid]}`)
    }
    nArgs = nArgs.map(value => this.toData(value));
    let sendObj = {
      cid,
      event_name,
      page_name: this.getPageName(),
      args: nArgs,
      wsClientFingerprint: this.getOrSetIfNotExists(`wsClientFingerprint`, this.generateCID(128)),
      startTime: Date.now()
    }
    this.webSocketMessageQueue.push(sendObj)
    this.sendToWebsocket()
  }

  sendToWebsocket() {
    if (this.sendToWebsocketProcess) {
      if (this.sendToWebsocketEvent) {
        clearInterval(this.sendToWebsocketEvent);
      }
      return;
    }
    this.sendToWebsocketProcess = true;
    const sendNextMessage = () => {
      if (this.webSocketMessageQueue.length === 0) {
        this.sendToWebsocketProcess = false;
        if (this.sendToWebsocketEvent) {
          clearInterval(this.sendToWebsocketEvent);
        }
        return;
      }
      const sendData = this.webSocketMessageQueue.shift();
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        try {
          let stringiryData = JSON.stringify(sendData)
          this.webSocket.send(stringiryData);
          const cid = sendData.cid;
          if (debug_send_event) {
            console.log(`websocket: Message has been sent, cid ${cid}`);
            // console.log(`websocket: `,sendData);
          }
          sendNextMessage(); // 递归发送下一条消息
        } catch (e) {
          console.log(`--------------- Error ---------------`);
          console.log(e);
          console.log(`(websocket)Error : ${this.webSocketMessageQueue.length}, messages have not been sent yet`);
          this.webSocketMessageQueue.push(sendData);
          this.sendToWebsocketProcess = false;
          if (this.sendToWebsocketEvent) {
            clearInterval(this.sendToWebsocketEvent);
          }
          this.sendToWebsocketEvent = setInterval(() => {
            this.sendToWebsocket();
          }, 500);
        }
      } else {
        console.log(`webSocket: ${this.webSocketMessageQueue.length}, messages have not been sent yet`);
        this.webSocketMessageQueue.push(sendData);
        this.sendToWebsocketProcess = false;
        if (this.sendToWebsocketEvent) {
          clearInterval(this.sendToWebsocketEvent);
        }
        this.sendToWebsocketEvent = setInterval(() => {
          this.sendToWebsocket();
        }, 500);
      }
    };
    sendNextMessage();
  }


  classified_on(event_name, callback) {
    if (!this.classifiedOnCallbacks[event_name]) {
      this.classifiedOnCallbacks[event_name] = []
    }
    this.classifiedOnCallbacks[event_name].push(callback)
  }

  toString(obj, indent = 2) {
    if (typeof obj == 'string' || typeof obj == 'number') {
      obj = "" + obj
      // obj = obj.replace(/\\/g, '/');
      // obj = obj.replace(/`/g, '"');
      obj = obj.replace(/\x00/g, '')
      return obj;
    } else {
      if (obj === null) {
        return `null`;
      }
      else if (obj === false) {
        return `false`;
      }
      else if (obj === true) {
        return `true`;
      } else if (Array.isArray(obj)) {
        const formattedArray = obj.map(item => this.toString(item, indent));
        return `[${formattedArray.join(', ')}]`;
      } else {
        try {
          let str = JSON.stringify(obj);
          return str;
        } catch (error) {
          let str = obj.toString()
          return str;
        }
      }
    }
  }

  save_config_cast_config(selector, value, value_type, options) {
    let update_config = {}
    update_config[selector] = {
      value,
      options,
      value_type
    }
    this.classified_send('configWidget:cast_config_one', update_config)
  }

  getBaseConf() {
    this.classified_send(`configWidget:getInitConfig`, (rData) => {
      console.log(`configWidget:getDefaultConfig`)
      console.log(rData.data)
      let baseConfig = rData.data
      this.cast_config(baseConfig)
    })
  }

  execute(data, ...args) {

  }

  cast_config(baseConfig) {
    for (let key in baseConfig.config) {
      config[key] = baseConfig.config[key]
    }
    for (let key in baseConfig.config_base) {
      config_base[key] = baseConfig.config_base[key]
    }
    for (let key in baseConfig.raw_config) {
      let values = baseConfig.raw_config[key]
      this.set_value(key, values)
    }
  }

  execReceive(recieve_on, rData) {
    let mainClassName = rData.main_class ? rData.main_class : `preload`
    let mainClases = [this]

    //window.electron[register_name]
    switch (mainClassName) {
      // case "preload":
      // mainClases = [this]
      // break
      case "public":
        mainClases = window.electron["public"]
        break
      default:
        mainClases = window.electron[mainClassName]
    }
    if (debug_recieve_execute_event || true) {
      console.log(` --------recieve_on ${recieve_on}--------`)
      console.log(`mainClassName : ${mainClassName}`)
      console.dir(mainClases)
      console.log(`recieve_on : ${recieve_on}`)
      console.log(rData)
      console.log(`\n`)
    }
    if (mainClases) {
      mainClases.forEach((mainClass) => {
        console.dir(mainClass)
        if (mainClass[recieve_on]) {
          rData.self = mainClass
          mainClass[recieve_on](rData)
        } else {
          console.dir(mainClases)
          console.log(`execReceive the ${recieve_on} does not exist in class ${mainClassName}`)
        }
      })
    } else {
      console.dir(mainClases)
      console.log(`execReceive ${recieve_on} does not exist in class ${mainClassName}`)
    }
  }

  toJSON(obj) {
    if (obj instanceof HTMLElement) {
      return this.convertObjectToKeyValue(obj)
    } else if (typeof obj != 'object' || Array.isArray(obj)) {
      try {
        obj = JSON.parse(obj)
        return obj
      } catch (e) {
        console.log(e)
        return {
          data: obj
        }
      }
    }
    return obj
  }

  convertObjectToKeyValue(element) {
    if (typeof element == 'string') {
      return element
    }
    const result = {};
    const attributes = element.attributes;
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      result[attribute.name] = attribute.value;
    }
    return result;
  }

  set_value(selector, value_object) {
    let elements
    try {
      elements = document.querySelectorAll(selector)
      let value
      let options
      if (typeof value_object == 'object' && value_object !== null) {
        value = value_object.value
        options = value_object.options
      } else {
        value = value_object
        options = ``
      }
      elements.forEach(element => {
        switch (element.type) {
          case 'checkbox':
            if (typeof value == 'string') {
              value = value.toLowerCase()
            }
            element.checked = value == true || value == "true" || (value && value != 'false');
            break;

          case 'radio':
            element.checked = element.value == value;
            break;
          case 'select':
          case 'select-one':
          case 'select-multiple':
            [...element.options].forEach(option => {
              if (Array.isArray(value)) {
                option.selected = value.includes(option.value);
              } else {
                option.selected = option.value == value;
              }
            });
            break;
          case 'file':
            console.warn('Cannot set the value of file input programmatically.');
            break;
          default:
            element.value = value;
            break;
        }
      });
    } catch (e) {
      return
    }
  }

  isNumeric(str) {
    if (typeof str == 'number') {
      return true;
    }
    if (typeof str != 'string') {
      return false;
    }
    return !isNaN(str) && !isNaN(parseFloat(str));
  }

  isInteger(str) {
    return /^-?\d+$/.test(str);
  }

  isFloat(str) {
    return /^-?\d+(\.\d+)?$/.test(str);
  }

  get_value(selector_or_element) {
    let element
    if (typeof selector_or_element == 'string') {
      element = document.querySelector(selector_or_element);;
    }
    else {
      element = selector_or_element
    }
    let value = null;
    switch (element.type) {
      case 'checkbox':
        value = element.checked;
        break;

      case 'radio':
        if (element.checked) {
          value = element.value;
        }
        break;
      case 'select':
      case 'select-one':
        value = element.value;
        break;

      case 'select-multiple':
        value = [...element.selectedOptions].map(option => option.value);
        break;

      case 'file':
        value = [...element.files].map(file => file.name);
        break;

      default:
        value = element.value;
        break;
    }
    return value
  }

  getElement(selector) {
    if (typeof selector === 'object') {
      return selector
    }
    if (selector.includes(':')) {
      const [prefix, select] = selector.split(':');
      switch (prefix) {
        case 'id':
          selector = `#${select}`
          break
        case 'name':
          selector = `[name="${select}"]`
          break
        case 'className':
          selector = `.${select}`
          break
      }
    }
    return document.querySelector(selector)
  }

  add_totable(data, table_selector = '#account_list tbody') {
    let table
    if (typeof table_selector == 'string') {
      table = document.querySelector(table_selector);
    } else {
      table = table_selector.querySelector('tbody')
    }
    for (const key in data) {
      const newRow = table.insertRow(-1);
      newRow.setAttribute('data-account', key);
      let row_data = data[key]
      for (const row_key in row_data) {
        delete row_data['pwd']
        const newCell = newRow.insertCell(-1);
        newCell.innerHTML = row_data[row_key];
        newCell.setAttribute('data-key', row_key);
      }
    }
  }

  modify_totable(account, data, table_selector = '#account_list tbody') {
    let table
    if (typeof table_selector == 'string') {
      table = document.querySelector(table_selector);
    } else {
      table = table_selector.querySelector('tbody')
    }
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.dataset.account == account) {
        for (const key in data) {
          const cell = row.querySelector(`[data-key="${key}"]`);
          if (cell) {
            cell.innerHTML = data[key];
          }
        }
        break;
      }
    }
  }

  delete_totable(account, data, table_selector = '#account_list tbody') {
    let table
    if (typeof table_selector == 'string') {
      table = document.querySelector(table_selector);
    } else {
      table = table_selector.querySelector('tbody')
    }
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.dataset.account == account) {
        table.deleteRow(i);
        break;
      }
    }
  }

  randomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  generateCID(length = 16) {
    let result;
    do {
      result = this.randomString(length);
    } while (this.cids.includes(result));
    this.cids.push(result);
    return result;
  }

  convertObjectToKeyValue(element) {
    if (typeof element == 'string') {
      return element
    }
    const result = {};
    const attributes = element.attributes;
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      result[attribute.name] = attribute.value;
    }
    return result;
  }

  toData(obj) {
    if (obj instanceof HTMLElement) {
      return this.convertObjectToKeyValue(obj)
    } else {
      return obj
    }
  }

  extractFunctions(args) {
    let functions = [];
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] === 'function') {
        functions.push({
          index: i,
          func: args[i]
        });
        args[i] = null;
      }
    }
    return [args, functions];
  }

  getStorage(key) {
    const data = localStorage.getItem(key);
    if (data === null) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (error) {
      return data;
    }
  }

  setStorage(key, value) {
    if (typeof value === 'object' || Array.isArray(value)) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  }

  setOnceInLocalStorage(key, value) {
    const existingValue = localStorage.getItem(key);
    if (existingValue === null) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  getOrSetIfNotExists(key, value) {
    const existingValue = localStorage.getItem(key);
    if (existingValue === null) {
      localStorage.setItem(key, JSON.stringify(value));
      return value;
    } else {
      try {
        return JSON.parse(existingValue);
      } catch (error) {
        return existingValue;
      }
    }
  }

  tick() {
  }

}

let MainInstance = new Main();
MainInstance.setFrontendPublicMethods('preload', MainInstance)
if (!window.electron) {
  window.electron = {}
}
window.electron.prelad = MainInstance
MainInstance.autoExecBeforeByLoaded()
window.addEventListener('DOMContentLoaded', () => {
  MainInstance.main()
});

const get_config = () => {
  return config
}

const get_config_base = () => {
  return config_base
}


const send = (event_name, ...arg) => {
  if (!event_name.includes(`:`) && !event_name.includes(`.`)) {
    event_name = `event_${MainInstance.getPageName()}.${event_name}`
  }
  MainInstance.classified_send(event_name, ...arg)
}

const asyncSend = async (event_name, ...arg) => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const callback = (rData, event, args) => {
    if (debug_recieve_execute_event) {
      console.log(` -- ${rData.rawData.event_name} Promise callback --`)
      console.log(` usetime: ${rData.usetime}ms`)
      console.log(rData)
    }
    let data = rData.data
    if (args) {
      resolve(data, event, ...args);
    } else {
      resolve(data, event, args);
    }
  }
  arg.push(callback)
  if (arg) {
    send(event_name, ...arg);
  } else {
    send(data, arg);
  }
  return promise;
};

const iconImageLoadError = (imgEle, iId) => {
  let src = imgEle.getAttribute('src')
  let title = imgEle.getAttribute('title')
  let id = imgEle.getAttribute('id')
  console.error(`src : ${src}`)
  console.error(`title : ${title}`)
  console.error(`id : ${id}`)
  send('shortcutIconWidget:getDefaultImageBase64Icon', (rData) => {
    imgEle.setAttribute('onerror', null)
    imgEle.src = rData.data
  })
}

const runExe = (exeEle) => {
  let exists = exeEle.getAttribute('data-exists')
  let basename = exeEle.getAttribute('data-basename')
  alertify.success(`运行 ${basename}`);
  if (exists == 'true') {
    send('events:runexe', exeEle, (rData, stdout) => {
      let data = rData.data[0]
      let runmode = ''
      if (data.runmode == 'admin') {
        runmode = '(管理员)'
      }
      if (basename) {
        alertify.success(`执行成功 ${basename} ${runmode}`);
        basename = null
      }
    })
  }
}

const registerPpublicMethod = (register_name, instance) => {
  if (!instance) {
    instance = register_name
    register_name = MainInstance.getPageName()
  }
  // const methods = {};
  // const proto = Object.getPrototypeOf(instance);

  // Object.getOwnPropertyNames(proto).forEach(name => {
  //   const descriptor = Object.getOwnPropertyDescriptor(proto, name);
  //   if (descriptor && typeof descriptor.value === 'function' && name !== 'constructor') {
  //     methods[name] = (rData) => {
  //       descriptor.value(rData)
  //     };
  //   }
  // });
  if (!window.electron) {
    window.electron = {}
  }
  if (!window.electron[register_name]) {
    window.electron[register_name] = []
  }
  window.electron[register_name].push(instance)
  // MainInstance.setFrontendPublicMethods(register_name, methods)
}
