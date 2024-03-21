const fs = require('fs');
const path = require('path');
const fileUnit = require('../unit/fileUnit.js');
const stringUnit = require('../unit/stringUnit.js');
const httpWidget = require('../widget/httpWidget.js');
const shortcutIconWidget = require('./shortcutIconWidget.js');
const encyclopedia = require('../comlib/encyclopedia.js').getEncyclopedia();

class Main {
    imagePath = false
    current_page = null
    page_queue = []
    hasBeenPageList = []
    installProgressTimers = {}
    progressTimers = {}

    startInstallProgress(secondsPassed = 0, stageProgress = 10, aid, maxProgress = 100, status = true, step = 1) {
        if (!this.installProgressTimers[aid]) {
            this.installProgressTimers[aid] = {
                status: true
            }
        }
        this.installProgressTimers[aid].secondsPassed = secondsPassed
        this.installProgressTimers[aid].maxProgress = maxProgress
        this.installProgressTimers[aid].stageProgress = stageProgress
        if (this.installProgressTimers[aid].status) {
            this.installProgressTimers[aid].status = status
        }
        if (!this.installProgressTimers[aid].imgid) {
            this.installProgressTimers[aid].imgid = shortcutIconWidget.genImagIdByAid(aid)
        }
        if (!this.installProgressTimers[aid].timer) {
            this.installProgressTimers[aid].timer = setInterval(() => {
                let processObj = this.installProgressTimers[aid]
                let secondsPassed = processObj.secondsPassed
                let maxProgress = processObj.maxProgress
                let stageProgress = processObj.stageProgress
                let status = processObj.status
                let imgid = processObj.imgid
                let claer = !status
                let stop = secondsPassed >= maxProgress || !status

                console.log(`secondsPassed , stageProgress , status , claer , stop`)
                console.log(secondsPassed, stageProgress, status, claer, stop)
                if (stop) {
                    httpWidget.sendToWebSocket(`public:removeInstallProgress`, {
                        secondsPassed, aid, imgid, claer
                    })
                    clearInterval(this.installProgressTimers[aid].timer);
                    this.installProgressTimers[aid] = null
                } else {
                    if (secondsPassed < stageProgress) {
                        let claer = !status
                        secondsPassed += step;
                        this.installProgressTimers[aid].secondsPassed = secondsPassed
                        httpWidget.sendToWebSocket(`public:updateInstallProgress`, {
                            secondsPassed, aid, imgid, claer
                        })
                    } else {
                        this.installProgressTimers[aid].secondsPassed = stageProgress
                    }
                }
            }, 500);
        }
    }

    addInstallProgress(addValue, maxValue, aid) {
        let processObj = this.installProgressTimers[aid]
        let secondsPassed
        if (processObj) {
            secondsPassed = this.installProgressTimers[aid].secondsPassed + addValue
        }
        if (maxValue > secondsPassed) {
            this.startInstallProgress(secondsPassed, maxValue, aid)
        }
    }

    startProgress(secondsPassed = 0, stageProgress = 10, aid, msg = '', maxProgress = 100, status = true, step = 1) {
        aid = stringUnit.create_id(aid)
        if (!this.progressTimers[aid]) {
            this.progressTimers[aid] = {
                status: true
            }
        }
        this.progressTimers[aid].secondsPassed = secondsPassed
        this.progressTimers[aid].maxProgress = maxProgress
        this.progressTimers[aid].stageProgress = stageProgress
        if (this.progressTimers[aid].status) {
            this.progressTimers[aid].status = status
        }
        if (!this.progressTimers[aid].imgid) {
            this.progressTimers[aid].imgid = shortcutIconWidget.genImagIdByAid(aid)
        }
        if (!this.progressTimers[aid].timer) {
            this.progressTimers[aid].timer = setInterval(() => {
                let processObj = this.progressTimers[aid]
                let secondsPassed = processObj.secondsPassed
                let maxProgress = processObj.maxProgress
                let stageProgress = processObj.stageProgress
                let status = processObj.status
                let imgid = processObj.imgid
                let claer = !status
                let stop = secondsPassed >= maxProgress || !status

                console.log(`secondsPassed , stageProgress , status , claer , stop`)
                console.log(secondsPassed, stageProgress, status, claer, stop)
                if (stop) {
                    httpWidget.sendToWebSocket(`public:removeInstallProgress`, {
                        secondsPassed, aid, imgid, claer, maxProgress, msg
                    })
                    clearInterval(this.progressTimers[aid].timer);
                    this.progressTimers[aid] = null
                } else {
                    if (secondsPassed < stageProgress) {
                        let claer = !status
                        secondsPassed += step;
                        this.progressTimers[aid].secondsPassed = secondsPassed
                        httpWidget.sendToWebSocket(`public:addProgress`, {
                            secondsPassed, aid, imgid, claer, maxProgress, msg
                        })
                    } else {
                        this.progressTimers[aid].secondsPassed = stageProgress
                    }
                }
            }, 1000);
        }
    }

    addProgress(addValue, maxValue, aid) {
        aid = stringUnit.create_id(aid)
        let processObj = this.progressTimers[aid]
        let secondsPassed
        if (processObj) {
            secondsPassed = this.progressTimers[aid].secondsPassed + addValue
        }
        if (maxValue > secondsPassed) {
            this.startProgress(secondsPassed, maxValue, aid)
        }
    }

    set_htmlviewdragableregion() {
        let htmlviewdragableregion = {
            dragable: {
                style: "-webkit-app-region: drag;",
                selectors: [".soft-title"]
            },
            disdrag: {
                style: "-webkit-app-region: no-drag;",
                selectors: ['.soft-control-window']
            },
            select: {
                style: "-webkit-user-select: text;",
                selectors: []
            },
            nonselect: {
                style: "-webkit-user-select: none;",
                selectors: ["body"]
            }
        }
    }

    set_style(select, styles) {
        let jscode = ``
        for (let style_name in styles) {
            let style_value = styles[style_name]
            style_name = stringUnit.convertToCamelCase(style_name)
            style_value = stringUnit.convertStyleValue(style_value)
            jscode += `ele.style.${style_name} = '${style_value}';\n`
        }
        if (jscode) {
            jscode = `
            document.querySelectorAll('${select}').forEach(ele=>{
                ${jscode}
            })
            `
            this.exejs(jscode)
        }
    }

    exejs(jscode) {
        let event_name = "public:exejs"
        let data = { jscode }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    getImagePath() {
        if (!this.imagePath) {
            this.imagePath = fileUnit.getTemp(`temp_img.png`)
        }
        return this.imagePath
    }

    async readImageByRemote(callback) {
        let imagePath = this.getImagePath()
        const bing_main_url = `https://cn.bing.com`
        const bing_url = `${bing_main_url}/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`
        let data = await httpWidget.getJSON(bing_url)
        let url = data.images[0].url.replaceAll('_1920x1080', '_UHD')
        let bing_image_url = bing_main_url + url
        httpWidget.readRemoteImage(bing_image_url).then((imageBase64) => {
            fs.writeFileSync(imagePath, Buffer.from(imageBase64, 'base64'));
            if (callback) callback(imagePath)
        }).catch(e => { })
    }

    setBackgroundFromBase64(imageBase64, selector = 'body') {
        httpWidget.sendToWebSocket(`public:setBackground`, {
            selector,
            imageBase64
        })
    }

    setBackgroundByLocal(selector) {
        let imagePath = this.getImagePath()
        let imageBase64
        if (fs.existsSync(imagePath)) {
            imageBase64 = fileUnit.readBase64ByFile(imagePath)
        } else {
            imageBase64 = fileUnit.readBase64ByFile(fileUnit.get_stylesheet(`img/default_desktop.jpeg`))
        }
        if (imageBase64) {
            this.setBackgroundFromBase64(imageBase64, selector)
        }
    }

    setBackgroundByNetwork(selector) {
        this.readImageByRemote((imagePath) => {
            let imageBase64 = fileUnit.readBase64ByFile(imagePath)
            this.setBackgroundFromBase64(imageBase64, selector)
        })
    }

    setBackground(selector = 'body') {
        this.setBackgroundByLocal(selector)
        this.setBackgroundByNetwork(selector)
    }

    addHTMLAfter(select, html) {
        if (!html) return
        let event_name = "public:addHTMLAfter"
        let data = {
            html,
            select
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }
    addHTMLAfterNotRefresh(select, html) {
        if (!html) return
        let event_name = "public:addHTMLAfterNotRefresh"
        let data = {
            html,
            select,
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    addHTMLBefore(select, html) {
        if (!html) return
        let event_name = "public:addHTMLBefore"
        let data = {
            html,
            select,
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }
    addHTMLToInnerAfter(select, html) {
        if (!html) return
        let event_name = "public:addHaddHTMLToInnerAfterTMLBefore"
        let data = {
            html,
            select,
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }
    addHTMLToInnerBefore(select, html) {
        if (!html) return
        let event_name = "public:addHTMLToInnerBefore"
        let data = {
            html,
            select,
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }
    addHTMLToInnerBeforeOne(select, html, verifyId, info = false) {
        if (!html) return
        let event_name = "public:addHTMLToInnerBeforeOne"
        let data = {
            html,
            select,
            verifyId,
            info
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    showElement(select) {
        let event_name = "public:showElement"
        let data = { select }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    replaceClass(select, classA, classB) {
        let event_name = "public:replaceClass"
        let data = {
            select,
            classA,
            classB
        }

        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    setInnerText(select, text) {
        let event_name = "public:setInnerText"
        let data = {
            select,
            text,
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    log(msg) {
        let event_name = "public:log"
        let data = msg
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    setInnerHTML(select, html) {
        let data = {
            select,
            html,
        }
        let event_name = "public:setInnerHTML"
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    removeElement(select) {
        let data = {
            select,
        }
        let event_name = "public:removeElement"
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    addClass(select, className) {
        let data = {
            select, className
        }
        let event_name = "public:addClass"
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    removeClass(select, className) {
        let event_name = "public:removeClass"
        let data = {
            select,
            className
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    toggleClass(select, className) {
        let event_name = "public:toggleClass"
        let data = {
            select,
            className
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    hideElement(select) {
        let event_name = "public:hideElement"
        let data = {
            select,
        }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    updateHTMLAfterInserToInnerBefore(upId, insertId, html, override = true) {
        let event_name = "public:updateHTMLAfterInserToInnerBefore"
        let data = { upId, insertId, html, override }
        httpWidget.sendToWebSocket(event_name, data, null, true)
    }

    pie(id, pie_outlook, pie_background, w, h) {
        html = `
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <pattern id="${id}_pie_outlook" x="0" y="0" width="1" height="1" viewBox="0 0 ${w} ${w}" preserveAspectRatio="xMidYMid slice">
                    <image width="${w}" height="${h}" xlink:href="${pie_outlook}"></image>
                </pattern>
            </defs>
        </svg>
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <pattern id="${id}_pie_background" x="0" y="0" width="1" height="1" viewBox="0 0 ${w} ${w}" preserveAspectRatio="xMidYMid slice">
                    <image width="${w}" height="${h}" xlink:href="${pie_background}"></image>
                </pattern>
            </defs>
        </svg>
        <figure id="selft-pie2" style="position:relative;width:200px;height:200px;">
        <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;-webkit-transform: rotate(-90deg);transform: rotate(-90deg);overflow:visible;">
            <circle r="100" cx="${w}" cy="${w}" style="fill:url(#pie_outlook);"></circle>
            <circle r="50.5" cx="${w}" cy="${w}" style="fill: rgb(26, 188, 156,0);stroke:url(#pie_background);;stroke-width: ${w}px;stroke-dasharray: 161.503px, 316.673px;"></circle>
        </svg>
	    </figure>
        `
        return html
    }

    getPreviousPage() {
        if (this.page_queue.length >= 2) {
            return this.page_queue[this.page_queue.length - 2]
        }
        return null
    }

    checkCurrentPage(page) {
        return page == this.current_page
    }

    getCurrentPage() {
        return this.current_page
    }

    setHasBeenPage(page) {
        if (!this.hasBeenPageList.includes(page)) {
            this.hasBeenPageList.push(page)
        }
    }

    isHasBeenPage(page) {
        return this.hasBeenPageList.includes(page)
    }

    autoExecBeforeByLoaded(page_name) {
        if (!this.isHasBeenPage(page_name)) {
            this.execPageEvent(page_name, `autoExecBeforeByLoadedOne`)
        }
        console.log(`autoExecBeforeByLoaded ${page_name}`)
        this.execPageEvent(page_name, `autoExecBeforeByLoaded`)
    }

    autoExecAfterByLoaded(page_name) {
        this.setHasBeenPage(page_name)
        this.page_queue.push(page_name)
        this.current_page = page_name
        if (!this.isHasBeenPage(page_name)) {
            this.execPageEvent(page_name, `autoExecAfterByLoadedOne`)
        }
        this.execPageEvent(page_name, `autoExecAfterByLoaded`)

        let previous_page = this.getPreviousPage()
        if (previous_page) {
            this.execPageEvent(previous_page, `closeAfterDestructe`)
        }
    }

    execPageEvent(page_name, event_name) {
        let category_name = `event_${page_name}`
        if (encyclopedia[category_name]) {
            let category_event = encyclopedia[category_name]
            console.log(`category_name ${category_name}`)
            console.log(`page_name ${page_name}`)
            // console.log(category_event)
            if (category_event[event_name]) {
                category_event[event_name]()
            } else {
                console.log(`There is no "${event_name}" event under the classification object "${category_name}", please add it to "html_events/${category_name}_event.js"`)
            }
        } else {
            console.log(`If there is no such classified event object, please add "${category_name}" and the init() method in the "html_events/" folder`)
        }
    }

    loadPageBaseJS(page_name) {
        let files = [
            `../../res_events/load_${page_name}.js`,
        ]
        // files.forEach((ref, i) => {
        //     files[i] = path.join(__dirname, ref);
        // });
        return files
    }
}

module.exports = new Main()