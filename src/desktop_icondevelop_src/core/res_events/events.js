const { BrowserView, session, clipboard } = require('electron');
const path = require('path')
// const puppeteer = require('puppeteer-core');
const fs = require('fs');
// const { dir } = require("console");
const {
	app,
    win,
} = require('../component/comlib/component.js');
const {
	stringUnit,
    // fileUnit,
    // utilUnit,
    // frameUnit,
} = require('../component/comlib/unit.js');
const {
	httpWidget,
	// shortcutRegistrationWidget,
	winapiWidget,
    // wingetWidget,
    messageWidget,
    // zipWidget,
    // htmlWidget,
	// shortcutIconWidget,
} = require('../component/comlib/widget.js');
const {config_base,config} = require('../component/comlib/config.js');
const initialize_environment_to_system = require('../main/initialize_environment_to_system.js');
const auto_update = require('../main/auto_update.js');

class Events {
    Browsers = []
    winBrowsers = []
    viewsdata = []
    view_height = 50
    login_account = []
    close_confirm = false
    close_countnum = 0
    currentReadMessageIndex = 0
    chatsendviewroleindex = 0
    cidRawData = {}
    cidWsRawDatas = {}

    constructor(){
        initialize_environment_to_system
        this.winBrowsers.push(win)
    }

    setCidRawData(cid, data) {
        this.cidRawData[cid] = data
    }

    getCidRawData(cid, del = false) {
        let result = this.cidRawData[cid]
        if (del) delete this.cidRawData[cid]
        return result
    }

    setWSCidRawData(wsCId, data) {
        let cid = data.cid
        if (!this.cidWsRawDatas[wsCId]) {
            this.cidWsRawDatas[wsCId] = {}
        }
        this.cidWsRawDatas[wsCId][cid] = data
    }

    getWSCidRawData(wsCId, cid) {
        if (this.cidWsRawDatas[wsCId] && this.cidWsRawDatas[wsCId][cid]) {
            let callbak = this.cidWsRawDatas[wsCId][cid]
            delete this.cidWsRawDatas[wsCId][cid]
            return callbak;
        }
        return null;
    }

    back_applications() {
    }

    get_status(status = 'danger', info = "") {
        return `<span class="badge badge-pill badge-${status}">${info}</span>`
    }

    showsettings() {
        win.webContents.executeJavaScript('document.querySelector(".sessting_page").style.display="block"')
    }

    show() {
        win.webContents.executeJavaScript('document.querySelector(".sessting_page").style.display="none"')
    }

    async chatsend(data, event) {
        const x = parseInt(data.x)
        const y = parseInt(data.y)
        const bx = parseInt(data.bx)
        const by = parseInt(data.by)
        const role = data.role
        let mode = data.mode
        if (!mode) {
            mode = 'all'
        }
        let views = []
        switch (mode) {
            case "single":
                views = [this.Browsers[role]]
                break
            case "all":
                views = this.Browsers
                break
            case "cycle":
                this.Browsers.forEach((view, index) => {
                    let viewsdata = this.get_viewsdata({
                        target_role: index,
                        return: true,
                    })
                    if (viewsdata && viewsdata.AccountStatsu && viewsdata.AccountStatsu == '已进入房间') {
                        views.push(view)
                    }
                })

                if (this.chatsendviewroleindex >= views.length) {
                    this.chatsendviewroleindex = 0
                }
                views = [views[this.chatsendviewroleindex]]
                this.chatsendviewroleindex++
                break
        }

        const previousClipboardContent = clipboard.readText();
        const textToCopy = await this.readMessage();
        clipboard.writeText(textToCopy);
        views.forEach((browserView, index) => {
            browserView.webContents.sendInputEvent({
                type: 'mouseDown',
                x: x,
                y: y,
                globalX: x,
                globalY: y,
                button: 'left',
                clickCount: 1,
            });
            // 发送鼠标抬起事件
            browserView.webContents.sendInputEvent({
                type: 'mouseUp',
                x: x,
                y: y,
                globalX: x,
                globalY: y,
                button: 'left',
                clickCount: 1,
            });
            // 模拟按下 Control+V (粘贴)
            browserView.webContents.sendInputEvent({
                type: 'keyDown',
                keyCode: 'V',
                modifiers: ['control'],
            });

            browserView.webContents.sendInputEvent({
                type: 'keyUp',
                keyCode: 'V',
                modifiers: ['control'],
            });
            // 粘贴操作完成后，将剪切板内容还原为之前的内容
            browserView.webContents.send('preload:execute', {
                action: 'sendMessage',
                data: {
                    message: clipboard.readText()
                }
            })
        })
        // let browserView = this.Browsers[role]
        setTimeout(() => {
            clipboard.writeText(previousClipboardContent);
        }, 200)
    }

    click_browserView(data, event) {
        let role = data.role
        let x = parseInt(data.x)
        let y = parseInt(data.y)
        let browserView = this.Browsers[role]
        browserView.webContents.sendInputEvent({
            type: 'mouseDown',
            x: x,
            y: y,
            globalX: x,
            globalY: y,
            button: 'left',
            clickCount: 1,
        });
        // 发送鼠标抬起事件
        browserView.webContents.sendInputEvent({
            type: 'mouseUp',
            x: x,
            y: y,
            globalX: x,
            globalY: y,
            button: 'left',
            clickCount: 1,
        });
    }

    log(message) {
        messageWidget.log(message)
    }

    success(message, timeout = 1500) {
        messageWidget.success(message, timeout)
    }

    error(message, timeout = 1500) {
        messageWidget.error(message, timeout)
    }

    confirm(message, timeout = 1500) {
        messageWidget.confirm(message, timeout)
    }

    warn(message, timeout = 1500) {
        messageWidget.warn(message, timeout)
    }

    get_viewsdata(data, event) {
        let target_role = data.target_role
        let role = data.role
        let target_data = this.viewsdata[target_role]
        if (data.return == true) {
            return target_data
        }
        // console.log('target_role',target_role)
        // console.log('role',role)
        // console.log('data',data)
        this.Browsers[role].webContents.send('set_data', this.viewsdata[target_role]);
    }

    send(event_name, data) {
        this.sendToAllViewBrowsers(event_name, data)
        this.sendToAllWinBrowsers(event_name, data)
    }

    sendToWin(event_name, data) {
        this.sendToAllWinBrowsers(event_name, data)
    }

    sendToAllViewBrowsers(event_name, data) {
        this.sendToAllBrowsers(this.Browsers, event_name, data)
    }

    sendToAllWinBrowsers(event_name, data) {
        this.sendToAllBrowsers(this.winBrowsers, event_name, data)
    }

    sendToAllBrowsers(winBrowsers, event_name, data) {
        if (typeof data != 'object') {
            data = {
                data,
                rawData: {
                    event_name: null
                }
            }
        }
        if (!data.rawData) {
            data = {
                data,
                rawData: {
                    event_name: null
                }
            }
        }

        let main_class = 'preload'
        let recieve_on = event_name
        if (event_name && (event_name.includes(`:`) || event_name.includes(`.`))) {
            let recieve_parse = event_name.split(/[\:\.]+/)
            main_class = recieve_parse[0]
            recieve_on = recieve_parse[1]
        }
        let send_id = `send_to_view_` + stringUnit.create_id()
        data.main_class = main_class
        data.recieve_on = recieve_on
        data.send_id = send_id
        if (!data.cid) data.cid = null
        winBrowsers.forEach((browser, index) => {
            if (data.viewIndex === undefined) {
                data.viewIndex = index
            }
            this.sendToView(`classified_receive`, data, browser)
        })
    }

    sendToView(event_name, data, browser) {
        browser.webContents.send(event_name, data);
    }

    sendToHtml(data, event) {
        if (!data) data = {}
        if (typeof data == "string") data = { data }
        let cid = typeof event === "object" && event !== null ? event.cid : null
        data.cid = cid
        data.usetime = null
        if (cid) {
            let rawData = this.getCidRawData(cid, true)
            if (rawData) {
                data.rawData = rawData
                data.startTime = rawData.startTime
                let endTime = Date.now()
                data.endTime = endTime
                data.usetime = endTime - data.startTime
            }
        }

        if (data.debug_recieve_event) {
        }
        httpWidget.sendToWebSocket(null, data)
    }

    runexe(ele, callback) {
        if (config.default_open_soft_mode) {
            return this.runasadmin(ele, callback)
        } else {
            let file = ele['data-exec']
            let group = ele['data-group']
            return winapiWidget.exec_explorer(file, group, config_base, callback)
        }
    }

    runasadmin(element_stringiry, callback) {
        let file = element_stringiry['data-exec']
        let group = element_stringiry['data-group']
        return winapiWidget.exec_asadmin(file, group, config_base, ``, callback)
    }

    opendir(element_stringiry) {
        let file = element_stringiry['data-exec']
        let dir = path.dirname(file)
        winapiWidget.exec_explorer(dir)
    }

    openicons() {
        winapiWidget.exec_explorer(config_base.icon_dir)
    }

    openicondir(icon_group_name) {
        if (!icon_group_name) {
            return this.openicons()
        }
        if (typeof icon_group_name == 'object') {
            icon_group_name = icon_group_name['data-group']
        }
        icon_group_name = path.join(config_base.icon_dir, icon_group_name)
        winapiWidget.exec_explorer(icon_group_name)
    }

    close_before() {
        this.Browsers.forEach((browserView, index) => {
            browserView.webContents.destroy();
            win.removeBrowserView(browserView);
        })
    }

    close_count(data, event) {
        if (this.close_confirm) {
            this.close_countnum++
            if (this.close_countnum >= this.Browsers.length || this.Browsers.length == 0) {
                this.close()
                return
            }
        }
    }

    close() {
        app.exit();
    }

    async start_cast() {
        if (this.Browsers.length > 1) {
            this.Browsers.forEach((browserView, index) => {
                this.viewsdata[index]['run_status'] = true
                browserView.webContents.send('cast_config', this.viewsdata[index]);
            })
        } else {
            let url = await win.webContents.executeJavaScript(`document.getElementById('pwd_main_url').value`)
            const width = 400;
            let height = 300;
            const Rows = 2;
            let y = 0;
            let x_base = 772

            let data = {
                url,
                width,
                height
            }

            const n = config.thread_number
            let window_height = parseInt(config_base.window_height)
            height = parseInt(window_height / n)
            let i = 0
            const intervalId = setInterval(() => {
                y = i * height;
                // data.x = x + x_base
                data.x = x_base
                data.y = y
                this.create_view(data)
                i++;
                if (i >= n) {
                    clearInterval(intervalId);
                }
            }, config.login_delay * 1000);
        }
    }

    create_view(data, event) {
        const browserView = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, '../preload/pre_view_loaded.js'), // 指定预加载脚本
                partition: `persist:view${this.Browsers.length}`,
            },
        });
        let url = data.url
        let height = 300
        let width = 400
        let x_base = 772
        let x = data.x
        let y = data.y
        if (x == undefined) {
            x = x_base
        }
        let y_base = 50
        if (y == undefined) {
            y = (this.Browsers.length * height) + y_base
        }
        win.addBrowserView(browserView);
        this.Browsers.push(browserView)
        let openDevTools = true
        if (!config_base.browserview_open_dev_tools) {
            openDevTools = false
        }
        browserView.setBounds({ x: x, y: y, width: width, height: height });
        browserView.webContents.loadURL(url);
        // browserView.webContents.on('did-finish-load', () => {
        //     // 在页面加载完成后执行自定义的 JS 代码
        //     // 覆盖 document.hidden 属性，始终返回 false（表示页面可见）
        //     // 改写 visibilitychange 事件的处理逻辑，使其在任何情况下都不会触发
        //     browserView.webContents.executeJavaScript(`
        //         Object.defineProperty(document, 'hidden', {
        //             get: () => false
        //         });
        //         const originalAddEventListener = EventTarget.prototype.addEventListener;
        //         EventTarget.prototype.addEventListener = function (type, listener, options) {
        //             if (type !== 'visibilitychange') {
        //                 originalAddEventListener.call(this, type, listener, options);
        //             }
        //         };
        //     `);
        // });
        if (openDevTools) {
            browserView.webContents.openDevTools({ mode: 'detach' });
        }
        browserView.webContents.audioMuted = true;
    }

    webViewCapturePage(data, event) {
        let role = data.role
        let browserView = this.Browsers[role]
        let view_number = this.Browsers.length
        setInterval(async () => {
            if (!this.capturePageCount) {
                this.capturePageCount = 0
            }
            const image = await browserView.webContents.capturePage();
            let filePath = path.join('screenshot', `screenshot-${view_number}-${this.capturePageCount}.png`);
            fs.writeFileSync(filePath, image.toPNG());
            this.capturePageCount++
        }, 1000)
    }

    image_load_error(img, event) {
        console.log(img)
    }

    minimize() {
        win.minimize()
    }

    maximize() {
        win.maximize()
    }

    relaunch() {
        app.relaunch(); // 启动一个新的进程
        app.exit(); // 关闭当前进程
    }

    software_update() {
        if (!this.software_update_exec) {
            this.software_update_exec = true
            this.success(`正在执行升级,请稍等`)
            auto_update.execUpdate((is_success) => {
                if (is_success) {
                    setTimeout(() => {
                        this.relaunch()
                    }, 2000)
                } else {
                    this.software_update_exec = undefined
                }
            })
        }
    }

    insatllEvn(data, event) {
        if (data['data-env']) {
            let evn = data['data-env']
            switch (evn) {
                case "visualstudio":
                    initialize_environment_to_system.install_visualstudio()
            }
            console.log(data, event)
        }
    }
}

module.exports = new Events()