(() => {
  const { contextBridge, ipcRenderer } = require('electron');
  let classifiedOnCallbacks = {}
  let classifiedCallbacks = {}
  let frontendPublicMethods = {}
  let publicConfig = {}
  let baseConfig = {}
  let cids = []
  debug_send_event = true
  debug_recieve_event = true
  debug_recieve_execute_event = true

  class Tools {
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
      } while (cids.includes(result));
      cids.push(result);
      return result;
    }

    getPageName() {
      let href = window.location.href
      let page_name
      const lastPart = href.split('/').pop();
      if (!lastPart || !lastPart.includes('.')) {
        page_name = lastPart;
      } else {
        const partsWithoutExtension = lastPart.split('.');
        partsWithoutExtension.pop();
        page_name = partsWithoutExtension.join('.');
      }
      return page_name
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
  }

  frontendPublicMethods["tools"] = new Tools()

  class Main {
    change_data_token = `data-change`
    loadBaseSentinel = false
    lsSentinelloadBase = null

    constructor() { }

    main() {
      this.getBaseConf()
      this.restore_default_configuration();
      this.startOn()
      this.loadPageBaseJS()
      this.autoExecAfterByLoaded()
      this.registerClickHandlers();
      this.addEventListenerAllConfig();
    }

    setFrontendPublicMethods(k, v) {
      if (!frontendPublicMethods[k]) {
        frontendPublicMethods[k] = []
      }
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
      return classifiedCallbacks
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
      this.classified_send(`htmlWidget:loadPageBaseJS`, page_name, (rData) => {
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

    restore_default_configuration() {
      this.classified_send(`configWidget:getPublicConfigToHTML`, (args) => {
        let data = args.data
        for (let selector in data) {
          let value_object = data[selector]
          this.set_value(selector, value_object)
        }
      })
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
                  this.classified_send(`events:${event_name}`, element)
                });
                console.log(`Event ${event_type}:${event_name} registered successfully.`);
              }
            }
          });
        }
      }
    }

    getPageName() {
      return this.getLastPartWithoutExtension(window.location.href)
    }

    getLastPartWithoutExtension(path) {
      const lastPart = path.split('/').pop();
      if (!lastPart || !lastPart.includes('.')) {
        return lastPart;
      }
      const partsWithoutExtension = lastPart.split('.');
      partsWithoutExtension.pop();
      return partsWithoutExtension.join('.');
    }

    classified_send(event_name, ...args) {
      let tools = frontendPublicMethods['tools']
      let cid = tools.generateCID(32)
      let [nArgs, callbackFunction] = tools.extractFunctions(args)
      if (callbackFunction.length) {
        if (!classifiedCallbacks[cid]) {
          classifiedCallbacks[cid] = []
        }
        classifiedCallbacks[cid] = classifiedCallbacks[cid].concat(callbackFunction)
      }

      if (debug_send_event) {
        console.log(`event_name ${event_name}`)
        console.log(classifiedCallbacks[cid])
      }
      nArgs = nArgs.map(value => tools.toData(value));
      let sendObj = {
        cid,
        event_name,
        page_name: tools.getPageName(),
        args: nArgs,
        startTime: Date.now()
      }
      ipcRenderer.send("register_event", sendObj);
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
      this.classified_send('events:cast_config', update_config)
    }

    generateCID(length = 16) {
      let result;
      do {
        result = this.randomString(length);
      } while (cids.includes(result));
      cids.push(result);
      return result;
    }

    randomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }

    getBaseConf() {
      this.classified_send(`configWidget:getDefaultConfig`, (rData) => {
        baseConfig = rData.data
      })
    }

    startOn() {
      if (!this.startOnToken) {
        ipcRenderer.on("classified_receive", (event, rData, ...args) => {
          let cid = rData.cid ? rData.cid : rData.send_id
          let data = rData.data

          if (debug_send_event === undefined) debug_send_event = rData.debug_send_event
          if (debug_recieve_event === undefined) debug_recieve_event = rData.debug_recieve_event
          if (debug_recieve_execute_event === undefined) debug_recieve_execute_event = rData.debug_recieve_execute_event

          let rawData = rData.rawData
          let event_name = rawData.event_name
          let recieve_on = rData.recieve_on
          if (debug_recieve_event) {
            console.log(`\n\n-------------- ${event_name} of receive --------------`)
            console.log(`idType`, cid)
            console.log(`recieve_on`, recieve_on)
            console.log(rData)
            console.log(`\n\n`)
          }

          if (recieve_on) {
            this.execReceive(recieve_on, rData, event, args)
          }
          if (cid) {
            let callbacks = this.getClassifiedCallbacks(cid, true)
            callbacks.forEach((callObject) => {
              let callback = callObject.func
              let index = callObject.index
              callback(rData, event, args)
            })
          }
        });
        this.startOnToken = true
      }
    }

    execute(data, ...args) {

    }

    cast_config(rData) {
      let data = rData.data
      publicConfig = data
      // console.log(`cast_config`)
      // console.log(publicConfig)
    }

    get_config_base() {
      return baseConfig
    }

    get_config() {
      return publicConfig
    }

    execReceive(recieve_on, rData, event, args) {
      let mainClassName = rData.main_class ? rData.main_class : `preload`
      let mainClases = [this]
      switch (mainClassName) {
        // case "preload":
        // mainClases = [this]
        // break
        case "public":
          mainClases = this.gFM(`public`)
          break
        default:
          mainClases = this.gFM(mainClassName)
      }
      if (debug_recieve_execute_event) {
        console.log(` --------recieve_on ${recieve_on}--------`)
        console.log(`mainClassName : ${mainClassName}`)
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
            console.log(`execReceive the called ${recieve_on} does not exist in class ${mainClassName}`)
            console.log(mainClases)
          }
        })
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
        if (typeof value_object == 'string') {
          value = value_object
          options = ``
        } else {
          value = value_object.value
          options = value_object.options
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

    generateCID(length = 16) {
      let result;
      do {
        result = this.randomString(length);
      } while (this.cids.includes(result));
      this.cids.push(result);
      return result;
    }

    randomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }

    startTick() {
      setInterval(() => {
        this.tick()
      }, 1000)
    }

    tick() {
    }

  }

  let MainInstance = new Main();

  contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: ipcRenderer,
    classified_send: MainInstance.classified_send,
    setFrontendPublicMethods: MainInstance.setFrontendPublicMethods,
    getClassifiedOnCallbacks: MainInstance.getClassifiedOnCallbacks,
    setClassifiedOnCallbacks: MainInstance.setClassifiedOnCallbacks,
    registerClickHandlers: MainInstance.registerClickHandlers,
    get_config: MainInstance.get_config,
    get_config_base: MainInstance.get_config_base,
    debug_send_event,
    debug_recieve_event,
    debug_recieve_execute_event,
  })

  // setInterval(() => {
  //   console.log(`event classifiedCallbacks`)
  //   console.log(MainInstance.getClassifiedOnCallbacks('test'))
  // }, 2000)

  MainInstance.autoExecBeforeByLoaded()
  window.addEventListener('DOMContentLoaded', () => {
    MainInstance.main()
  });



})()