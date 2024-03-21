const { contextBridge, ipcRenderer } = require('electron');
class Main {
  debug = false

  constructor() {
    window.addEventListener('DOMContentLoaded', () => {
      this.set_show()
      console.log(`网页已刷新,逻辑代码加载成功!当前页面,${window.location.href}`)
      this.registerClickHandlers();
      this.main()
      setTimeout(() => {
        this.start()
      }, 500)
    });
    contextBridge.exposeInMainWorld('electron', {
      register: this.register.bind(this),
      receive: this.receive()
    });
  }

  main() {
    window.onerror = (message, url, line, column, error) => {
      console.log("Error: " + message + "\nURL: " + url + "\nLine: " + line + "\nColumn: " + column + "\nStackTrace: " + error.stack);
      return true;
    }
    
    if (this.debug) {
      this.click_dot()
    }

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const newViewportMeta = document.createElement('meta');
      newViewportMeta.setAttribute('name', 'viewport');
      newViewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      if (document.head) {
        document.head.appendChild(newViewportMeta);
      }
    } else {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
  }

  set_show() {
    Object.defineProperty(document, 'hidden', {
      get: () => false
    });
    let originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (type !== 'visibilitychange') {
        originalAddEventListener.call(this, type, listener, options);
      }
    };
  }

  click_dot() {
    let styleTag = document.querySelector("style.click-dot-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.setAttribute("class", "click-dot-style");
      styleTag.textContent = ".click-dot { position: absolute; width: 5px; height: 5px; background-color: green; border-radius: 50%; display: none; z-index: 9999; }";
      document.head.appendChild(styleTag);
    }
    document.addEventListener("click", function (event) {
      let clickDot = document.createElement("div");
      clickDot.setAttribute("class", "click-dot");
      document.body.appendChild(clickDot);
      let x = event.clientX;
      let y = event.clientY;
      console.log("Clicked at: " + x + ", " + y);
      clickDot.style.left = x + "px";
      clickDot.style.top = y + "px";
      clickDot.style.display = "block";
      clickDot.style.zIndex = "999999";
    });
  }

  register(element, event_name) {
    const element_string = JSON.stringify(this.convertObjectToKeyValue(element));
    if (event_name) {
      ipcRenderer.send("register_event", event_name, element_string);
    } else {
      console.log(`Event ${event_name} not registered. Example: 'onclick=\"window.MainInstance.register(this, 'event_name')\"'`);
    }
  }

  registerClickHandlers() {
    const pre_class = 'event-';
    const elements = document.querySelectorAll(`[class*="${pre_class}"]`);
    for (const element of elements) {
      const classList = Array.from(element.classList);
      classList.forEach((classname) => {
        if (classname.startsWith(pre_class)) {
          classname = classname.split('-');
          if (classname.length < 3) {
            console.log(`Event ${classname} not registered: 'classname.length < 3'. Example: 'class=\"event-click(event_type)-event_name\"'`);
          } else {
            let event_type = classname[1];
            let event_name = classname[2];
            element.addEventListener(event_type, () => {
              this.register(element, event_name);
            });
            console.log(`Event ${event_type}:${event_name} registered successfully.`);
          }
        }
      });
    }
  }

  event(event_name, element_string) {
    ipcRenderer.send("register_event", event_name, element_string);
  }

  receive() {
    ipcRenderer.on("cast_config", (event, data) => {
      if (!this.pring_cast_config) {
        this.pring_cast_config = 0
      }
      if (this.pring_cast_config % 10 == 10) {
        console.log(`cast_config role:${data.role}`)
        console.log(data)
      }
      this.pring_cast_config++
      const dataStr = JSON.stringify(data);
      try {
        localStorage.setItem('castconfig', dataStr);
      } catch (e) {
        location.reload()
      }

    });

    ipcRenderer.on("set_data", (event, data) => {
      if (!this.pring_cast_config) {
        this.pring_cast_config = 0
      }
      if (this.pring_cast_config % 10 == 10) {
        console.log(`set_data role:${data.role}`)
        console.log(data)
      }
      const dataStr = JSON.stringify(data); 
      try {
        localStorage.setItem('setdata', dataStr);
      } catch (e) {
        location.reload()
      }
    });

    ipcRenderer.on("execute", (event, function_obj, ...args) => {
      let execute_name
      let data = {}
      if (function_obj) {
        if (typeof function_obj == 'string') {
          execute_name = function_obj
        } else {
          execute_name = function_obj.action
          data = function_obj.data
        }
        if (this[execute_name]) {
          this[execute_name](data, ...args)
        }
        if (this.TickCase[execute_name]) {
          this.TickCase[execute_name](data, ...args)
        }
      }
    });

    ipcRenderer.on("get_username_login", (event, data) => {
      this.TickCase.login_user(data)
    });

  }

  convertObjectToKeyValue(element) {
    const result = {};
    const attributes = element.attributes;
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      result[attribute.name] = attribute.value;
    }
    return result;
  }

  reload() {
    reload_count = Storage
  }

  start() {
    if (!this.TickCase) {
      this.TickCase = new TickCase()
    }
    setTimeout(() => {
      setInterval(() => {
        this.TickCase.check()
      }, 500)
      // let refreshCount
      // try {
      //   refreshCount = localStorage.getItem('refreshCount');
      // } catch (e) {
      //   location.reload()
      // }
      // refreshCount = refreshCount || 0;
      // refreshCount = parseInt(refreshCount);
      // if (refreshCount < 1) {
      //   location.reload();
      //   refreshCount++;
      //   localStorage.setItem('refreshCount', refreshCount);
      // } else {
      //   setTimeout(() => {
      //     localStorage.setItem('refreshCount', 0);
      //     setInterval(() => {
      //       this.TickCase.check()
      //     }, 1000)
      //   }, 5000)
      // }
    }, 500);
  }

  tick() {
    if (!this.TickCase) {
      this.TickCase = new TickCase()
    }
  }
}

class TickCase {
  enable_chat = null
  login_status = false
  tick_count = 0
  previousValue = null
  execute_counter = 0
  execute_threshold = 80

  constructor() {
  }

  sendEvent(event_name, element_string) {
    if (typeof element_string == 'object') {
      if (Object.keys(this.get_config()) > 0) {
        element_string.role = this.get_config().role
      }
    }
    ipcRenderer.send("register_event", event_name, element_string);
  }

  get_config(key) {
    let dataStr
    try {
      dataStr = localStorage.getItem('castconfig');
    } catch (e) {
      location.reload()
    }
    let data = {}
    if (dataStr) {
      data = JSON.parse(dataStr);
    }
    if (key) {
      return data[key]
    }
    return data
  }

  get_data(key) {
    let dataStr
    try {
      dataStr = localStorage.getItem('setdata');
    } catch (e) {
      location.reload()
    }
    let data = {}
    if (dataStr) {
      data = JSON.parse(dataStr);
    }
    if (key) {
      return data[key]
    }
    return data
  }

  set_values(data, role = undefined) {
    if (role != undefined) {
      data['role'] = role
    } else {
      data['role'] = this.get_config().role
    }
    this.sendEvent('set_values', data)
  }

  action(action) {
    this.sendEvent('set_values', {
      role: this.get_config().role,
      action
    })
  }

  findElementByTextContent(tagName = '*', text) {
    let Doc = document.getElementsByTagName('iframe');
    if (Doc.length) {
      Doc = iframes[0]
      Doc = iframes.contentDocument || iframes.contentWindow.document;
    } else {
      Doc = document
    }
    const elements = Doc.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      let content = element.textContent.replace(/[\s\n]+/g, '');
      content = content.trim()
      text = text.trim()
      if (content === text) {
        return element;
      }
    }
    return null;
  }

  findElementByProperty(tagName = '*', property) {
    let Doc = this.get_iframeDoc();
    const elements = Doc.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      for (const key in property) {
        if (element[key] != property[key]) {
          continue
        }
        return element;
      }
    }
    return null;
  }

  get_iframeDoc(selector) {
    if (selector) {
      let ele = document.querySelector(selector)
      if (!ele) {
        let iframes = document.getElementsByTagName('iframe');
        if (iframes.length) {
          iframes = iframes[0]
          iframes = iframes.contentDocument || iframes.contentWindow.document;
          ele = iframes.querySelector(selector)
        }
      }
      return ele
    }
    let iframes = document.getElementsByTagName('iframe');
    if (iframes.length) {
      iframes = iframes[0]
      iframes = iframes.contentDocument || iframes.contentWindow.document;
    } else {
      iframes = document
    }
    return iframes
  }

  ready_login() {
    return !!this.get_config().Login.LoginStatus
  }

  is_gameroom() {
    if (document.querySelector('#video-wrapper')) {
      return true;
    }
    return false;
  }

  send_ad(str, win_x, win_y) {
    let button = document.querySelector('button[data-role="message-input__button"]');
    if (button) {
      button = button.click();
    }
  }

  chat_isenable() {
    let Doc = this.get_iframeDoc()
    const messages = Doc.querySelectorAll('[data-role="chat-message__text"]');
    let message_text_list = Array.from(messages).map(message => message.innerHTML);
    // console.log('message_text_list', message_text_list)
    if (this.enable_chat === null || this.enable_chat === false) {
      if (message_text_list.includes('您的聊天权限已被启用。')) {
        this.sendEvent('set_account', {
          Username: this.get_config().Login.Username,
          Status: this.get_status('success', '聊天中'),
          ChatPermission: this.get_status('success', '已取得'),
        })
        this.enable_chat = true
      }
    }
    if (this.enable_chat === true) {
      if (message_text_list.includes('您的聊天权限已被禁用。')) {
        this.enable_chat = false
        this.sendEvent('set_account', {
          Username: this.get_config().Login.Username,
          Status: this.get_status('info', '停止聊天'),
          ChatPermission: this.get_status('danger', '已禁用'),
        })
      }
    }
    return this.enable_chat
  }

  getChatPermission() {
    if (this.get_config().role != 0) {
      return true
    }
    this.sendEvent('get_viewsdata', {
      target_role: 1,
      role: this.get_config().role,
    })
    let target_data = this.get_data()
    if (Object.keys(target_data) == 0) {
      console.log('wait target data')
      return
    }
    if (
      target_data.Login
      && target_data.Login.Status
      && (target_data.Login.Status == 'fail' || target_data.Login.Status == 'not_login')
    ) {
      return
    }

    if (!this.IsGromTime) {
      this.IsGromTime = 0
    }
    if (target_data.AccountStatsu != "已进入房间") {
      this.IsGromTime = 0
      return
    }
    this.IsGromTime++
    if (this.IsGromTime == 10) {
      if (!this.univer_beting) {
        this.univer_beting = true
        this.check_uniform_bet()
      }
    }
  }

  bet_frompoint() {
    let point_bet
    if (this.get_config().role == 0) {
      point_bet = {
        x: 159,
        y: 222,
      }
    } else {
      point_bet = {
        x: 243,
        y: 220,
      }
    }
    let point = {
      role: this.get_config().role,
      x: point_bet.x,
      y: point_bet.y,
    }
    let execute_count = 8
    this.intervalID = setInterval(() => {
      if (execute_count > 0) {
        this.sendEvent('click_browserView', point)
        console.log('click_browserView', point)
        execute_count--;
      } else {
        clearInterval(this.intervalID);
      }
    }, 500);
    // this.sendEvent('click_browserView', point)
    // this.sendEvent('click_browserView', point)
    // this.sendEvent('click_browserView', point)
    // this.sendEvent('click_browserView', point)
    // this.sendEvent('click_browserView', point)
    // this.sendEvent('click_browserView', point)
    // this.sendEvent('click_browserView', point)
  }

  bet_fromstatusbutton() {
    // let Doc = this.get_iframeDoc()
    let button
    if (this.get_config().role % 2 == 0) {
      var player = this.get_Playerbutton()
      button = player
    } else {
      var banker = this.get_Bankerbutton()
      button = banker
    }
    if (button) {
      button.click()
      button.click()
      button.click()
      button.click()
      button.click()
      button.click()
      button.click()
      button.click()
    }
  }

  uniform_bet() {
    let status_text
    if (this.get_config().role == 0) {
      status_text = "下注:闲"
    } else {
      status_text = "下注:庄"
    }
    // this.bet_frompoint()
    this.bet_fromstatusbutton()
    this.sendEvent('set_account', {
      Username: this.get_config().Login.Username,
      Status: this.get_status('success', status_text),
    })
  }

  is_betfromstatustext() {
    let status = this.get_iframeDoc('div[data-role="status-text"]')
    if (!status) {
      return false
    }
    status = status.innerHTML;
    let bate = /^\s*投注\s*\d+/g
    if (bate.test(status)) {
      const regex = /\d+/g;
      let numbers = status.match(regex);
      numbers = parseInt(numbers)
      return true
    } else {
      return false
    }
  }

  is_betfromdatacollapsed() {
    let status_ele = this.get_iframeDoc('[data-is-collapsed]')
    if (!status_ele) {
      return false
    }
    let status = status_ele.dataset.isCollapsed;
    if (status === 'true') {
      status = true
    } else if (status === 'false') {
      status = false
    }
    status = !status
    return status
  }

  check_uniform_bet() {
    if (this.check_uniform_betstatus) {
      return
    }
    let status = this.get_iframeDoc('div[data-role="status-text"]')
    if (status) {
      status = this.is_betfromstatustext()
    } else {
      status = this.is_betfromdatacollapsed()
    }
    if (status) {
      this.check_uniform_betstatus = TextTrackCueList
      this.sendEvent('uniform_bet')
    } else {
      this.sendEvent('set_account', {
        Username: this.get_config().Login.Username,
        Status: this.get_status('success', '等待'),
        ChatPermission: this.get_status('info', status),
      })
      setTimeout(() => {
        this.check_uniform_bet()
      }, 1000)
    }
  }

  get_status(status = 'danger', info = "") {
    return `<span class="badge badge-pill badge-${status}">${info}</span>`
  }

  check_executecount(value) {
    if (value === this.previousValue) {
      this.execute_counter++;
      let execute_threshold = this.execute_threshold
      if (value == 'login') {
        execute_threshold = execute_threshold * 2
      }
      console.log(`aciont ${value},account:${this.execute_counter}<${execute_threshold}`)
      if (this.execute_counter >= execute_threshold) {
        location.reload();
      }
    } else {
      this.previousValue = value;
      this.execute_counter = 1;
    }
  }

  login() {

    if (this.get_config().Login && this.get_config().Login.Username) {
      this.action(null)
      return
    }
    this.action('login')
    if (this.get_config().allow_login == true) {
      if (!this.logining) {
        this.set_values({
          Login: {
            Status: "not_login"
          }
        })
        this.logining = true
        // if (this.get_config().role == 0) {
        // }
        this.sendEvent('get_unuse_username', {
          target_role: this.get_config().role
        })

        console.log('start login...')
        if (!window.location.href.endsWith('#/Index')) {
          window.location.href = this.get_config().pwd_main_url + '/#/Index'
        }
      }
    } else {
      console.log('wait allow_login as login...')
    }
  }

  login_user(data) {
    if (!data || data.target_role == undefined) {
      console.log('not account data...')
      return
    }
    if (data.target_role != this.get_config().role) {
      console.log('account is not adaptor...')
      return
    }
    console.log('开始登陆账号', data)
    this.set_values({
      Login: {
        Status: "logining"
      }
    })

    let Username = data.Username
    const usernameInput = document.querySelector('input[placeholder="用户名"]');
    if (usernameInput) {
      usernameInput.value = Username;
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const passwordInput = document.querySelector('input[placeholder="密码"]');
    if (passwordInput) {
      passwordInput.value = data.pwd;
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const loginButton = document.querySelector('button[class="button1 change-bg-color ajax-submit-without-confirm-btn"]');
    if (loginButton) {
      loginButton.click();
    }
    setTimeout(() => {
      this.action(null)
      this.logining = false;
      let money = document.querySelector('.money-font')
      if (money) {
        money = money.textContent
        money = parseInt(money.match(/\d+/)[0]);
        money = parseInt(money)
      }
      if (typeof money === 'number' && money < 40) {
        this.sendEvent('delete_account', {
          Username: Username,
          Remarks: '余额不足删除',
        })
        this.outlogin()
      } else {
        this.login_status = true
        this.set_values({
          Login: {
            Username: Username,
            Status: "success",
            LoginStatus: true,
          },
          AccountStatsu: "已登陆"
        })
        let account_type = '喊话'
        let account_chat = '获取中..'
        if (this.get_config().role != 0) {
          account_type = '备用'
          account_chat = '配合中..'
        }
        this.sendEvent('set_account', {
          Username: Username,
          Balance: money,
          ChatPermission: this.get_status('info', account_chat),
          Status: this.get_status('success', '已登陆'),
          Remarks: account_type,
        })
        if (this.get_config().role == 0) {
          this.sendEvent('notify_login')
        }
      }
    }, 3000)
  }

  outlogin() {
    this.action('outlogin')
    let url = `/#/MemberCenter/Transfer`
    const usernameInput = document.querySelector('input[placeholder="用户名"]');
    if (usernameInput) {
      this.set_values({
        Login: {
          Status: "fail",
        }
      })
      this.sendEvent('close_count', {
        close_confirm: true,
        role: this.get_config().role
      })
      this.action(null)
      return
    }

    if (!window.location.href.endsWith(url)) {
      window.location.href = `${this.get_config().pwd_main_url}${url}`
    } else {
      let button = document.querySelector('#transfer > div.panel-body > div.transfer-box button.btn.btn-primary')
      if (button) {
        button.click()
      }
      setTimeout(() => {
        this.set_values({
          Login: {
            Status: "fail",
          }
        })
        this.action(null)
        button = document.querySelector('.logout1')
        if (button) {
          button.click()
        }
        this.sendEvent('close_count', {
          close_confirm: true,
          role: this.get_config().role
        })
      }, 5000)
    }
  }

  pageQuery(query_string = 'category', value, result = false) {
    const hash = window.location.hash;
    const jsonStr = hash.substring(1);
    const searchParams = new URLSearchParams(jsonStr);
    const entries = searchParams.entries();
    const obj = Object.fromEntries(entries);
    if (result) return obj;
    if (obj && obj[query_string] && obj[query_string] == value) {
      return true;
    }
    return false;
  }

  isGlist() {
    if (this.pageQuery('category', 'baccarat')) {
      return true
    }
    return false
  }

  dirToGlist() {
    let main_url = this.get_config().pwd_main_url
    this.action('dirToGlist')
    if (this.pageQuery('category', 'all_games')) {
      window.location.href = 'https://evo.gsoft288.net/frontend/evo/r3/#category=baccarat'
      let button = document.querySelector('#lobby-root > div > div > div > nav > button:nth-child(3)')
      if (button) {
        button.click()
      } else {
        let button = document.querySelector('#category-navigator-baccarat > div > span')
        if (button) {
          button.click()
        }
      }
      return
    }
    if (this.pageQuery('category', 'top_games')) {
      let button = document.querySelector('#category-navigator-baccarat > div > span')
      if (button) {
        button.click()
      }
      return
    }
    if (this.pageQuery('category', 'baccarat')) {
      let roomList = []
      document.querySelectorAll('p[data-role="tile-name"]').forEach((e) => {
        roomList.push(e.innerHTML)
      });
      this.set_values({
        '#room_select': roomList
      })
      this.action(null)
      return
    }
    if (!this.pageQuery('api_code', 'EVO')) {
      let ListUrl = `${main_url}/#/LoginToSupplier?gameCode=0&gameType=1&api_code=EVO`
      window.location.href = ListUrl
      return
    }
  }

  get_Playerbutton() {
    let Doc = this.get_iframeDoc()
    let player = Doc.querySelector('div.player--5adf8')
    if (!player) {
      player = Doc.querySelector('[data-role="bet-spot-dragon"]')
    }
    return player
  }

  get_Bankerbutton() {
    let Doc = this.get_iframeDoc()
    let banker = Doc.querySelector('div.banker--23b00')
    if (!banker) {
      banker = Doc.querySelector('[data-role="bet-spot-tiger"]')
    }
    return banker
  }

  isGrom() {
    let Doc = this.get_iframeDoc()
    var message_input__text = this.findElementByProperty('input', { placeholder: '单击进行聊天' });
    var player = this.get_Playerbutton()
    var banker = this.get_Bankerbutton()
    if (message_input__text && player) {
      // this.action(null)
      this.set_values({
        AccountStatsu: "已进入房间"
      })
      this.sendEvent('set_account', {
        Username: this.get_config().Login.Username,
        Status: this.get_status('success', '进入房间'),
      })
      return true
    }
    this.set_values({
      AccountStatsu: "不在房间"
    })
    this.sendEvent('set_account', {
      Username: this.get_config().Login.Username,
      Status: this.get_status('success', '寻找房间'),
    })
    return false
  }

  dirToRoom(roomname) {
    // this.action('dirToRoom')
    if (!roomname) {
      roomname = this.get_config().room_select
    }
    let button = this.findElementByTextContent('p', roomname)
    console.log(`dirToRoom`, button, '', roomname)
    if (button) {
      // this.action(null)
      button.click()
    }
  }

  active() {
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var centerX = viewportWidth / 2;
    var centerY = viewportHeight / 2;
    var halfWidth = 20;
    var halfHeight = 20;
    var left = centerX - halfWidth;
    var top = centerY - halfHeight;
    var right = centerX + halfWidth;
    var bottom = centerY + halfHeight;
    var x = Math.floor(Math.random() * (right - left)) + left;
    var y = Math.floor(Math.random() * (bottom - top)) + top;
    // var event = new MouseEvent("click", {
    //   view: window,
    //   bubbles: true,
    //   cancelable: true,
    //   clientX: x,
    //   clientY: y
    // });
    let point = {
      x,
      y,
      role: this.get_config().role
    }
    console.log('正在活跃账号,以防游戏停止.')
    this.sendEvent('click_browserView', point)
    // document.elementFromPoint(x, y).dispatchEvent(event);
  }


  broadcastMessage() {
    // if (this.get_config().role != 0) {
    //   return
    // }
    if (!this.broadcast_messagecount) {
      this.broadcast_messagecount = 0
    }
    let cast_interval = parseInt(this.get_config().cast_interval)
    if (this.broadcast_messagecount % cast_interval == 0) {
      let Doc = this.get_iframeDoc()
      let message_input__text = this.findElementByProperty('input', { placeholder: '单击进行聊天' });
      let message_input__button = Doc.querySelector(`[data-role="message-input__button"]`);
      let x = 0, y = 0
      if (message_input__text) {
        let rect = message_input__text.getBoundingClientRect();
        let buttonrect = message_input__button.getBoundingClientRect();
        x = rect.left
        y = rect.top
        let bx = buttonrect.left
        let by = buttonrect.top
        let chat_obj = {
          x,
          y,
          bx,
          by,
          role: this.get_config().role,
          mode: "cycle"
        }
        console.log(`发送聊天: 模式${this.get_config().radio_30}`, chat_obj)
        this.sendEvent('chatsend', chat_obj)
        setTimeout(() => {
          this.print_dot(x, y)
          this.print_dot(bx, bx)
          setTimeout(() => {
            let clickDots = document.querySelectorAll(".click-dot");
            clickDots.forEach(function (clickDot) {
              clickDot.remove();
            });
          }, 2000)
        }, 200)
      }
    } else {
      this.action()
    }
    this.broadcast_messagecount++
  }

  print_dot(x, y) {
    let styleTag = document.querySelector("style.click-dot-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.setAttribute("class", "click-dot-style");
      styleTag.textContent = ".click-dot { position: absolute; width: 5px; height: 5px; background-color: green; border-radius: 50%; display: none; z-index: 9999; }";
      document.head.appendChild(styleTag);
    }
    let clickDot = document.createElement("div");
    clickDot.setAttribute("class", "click-dot");
    document.body.appendChild(clickDot);
    console.log("Clicked at: " + x + ", " + y);
    clickDot.style.left = x + "px";
    clickDot.style.top = y + "px";
    clickDot.style.display = "block";
    clickDot.style.zIndex = "999999";
  }

  sendMessage(data) {
    if (!this.SuccessfulChatTimesCount) {
      this.SuccessfulChatTimesCount = 0
    }
    this.SuccessfulChatTimesCount++
    let Doc = this.get_iframeDoc()
    let message_input__button = Doc.querySelector(`[data-role="message-input__button"]`);
    message_input__button.click()
    console.log(`已经发送数据:${data.message}`, data)
    this.sendEvent('set_account', {
      Username: this.get_config().Login.Username,
      SuccessfulChatTimes: this.SuccessfulChatTimesCount,
    })
  }

  check() {
    this.tick_count++

    let submit_botton = this.findElementByTextContent('button', '确定')
    if (submit_botton) {
      submit_botton.click()
    }
    submit_botton = this.findElementByTextContent('span', '游戏由于未活动而暂停')
    if (submit_botton) {
      submit_botton = submit_botton.previousElementSibling
      if (submit_botton) {
        submit_botton.click()
      }
    }
    if (!this.get_valuesing) {
      this.get_valuesing = true
      ipcRenderer.send('register_event', 'get_values')
      return
    }
    if (Object.keys(this.get_config()) == 0) {
      console.log('wait castconfig')
      return
    }

    // if (this.get_config().role == 0) {
    //   let target_data = this.get_data()
    //   if (Object.keys(target_data) == 0) {
    //     this.sendEvent('get_viewsdata', {
    //       target_role: 1,
    //       role: this.get_config().role,
    //     })
    //     console.log('wait target data')
    //   } else {
    //     let notify_subaccounttick = 3
    //     if (
    //       target_data.Login
    //       && target_data.Login.Status
    //       && (target_data.Login.Status == 'fail' || target_data.Login.Status == 'not_login')
    //     ) {
    //       if (this.tick_count >= notify_subaccounttick) {
    //         let viewsdata_length = parseInt(this.get_config().viewsdata_length)
    //         for (let i = 0; i < viewsdata_length; i++) {
    //           if (i != 0) {
    //             this.set_values({
    //               allow_login: true,
    //             }, i)
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    if (this.get_config().run_status === false) {
      console.log('run stop')
      return
    }

    if (!this.print_role) {
      this.print_role = true
      let role_info = '主账号'
      if (this.get_config().role != 0) {
        role_info = '配合账号'
      }
      console.log(`当前窗口:${role_info},role:${this.get_config().role}`)
    }
    let action = this.get_config().action
    if (action) {
      let action_function = this[action]
      if (action_function) {
        this.check_executecount(action)
        this[action]()
      }
      return
    }
    if (!this.ready_login()) {
      console.log('还未登陆')
      this.login()
      return
    }
    if (!this.isGlist()) {
      this.dirToGlist()
      return
    }
    if (!this.isGrom()) {
      this.dirToRoom()
      return
    }
    if (this.enable_chat == false) {
      this.outlogin()
      return
    }
    if (!this.chat_isenable()) {
      this.getChatPermission()
      return
    }
    this.broadcastMessage()
  }
}

// 创建ElectronEvents实例
document.electronEvents = new Main();
