class PublicMain {
    cids = []
    timers = {}

    constructor() {
        this.commandContainer = $('.command-container');
        this.commandLines = this.commandContainer.find('.command-lines');
        this.commandTimer = null;
    }

    init() {
        $("#settieng_panel-circle, #show_setting,.setting-box-toggle").click(function () {
            $(".setting_panel_body").toggleClass("show");
        });
        $('.command-lines').slimScroll({
            color: '#0bb2d4'
            , size: '10px'
            , height: '200px'
            , alwaysVisible: true
        });
        send(`htmlWidget:setBackground`)
        this.checkInitSystem()
    }

    checkInitSystem() {
        send(`initialize_environment_to_system:checkInitSystem`, (rData) => {
            let data = rData.data
            console.log(`checkInitSystem`)
            console.log(data)
            if (data) {
                let isInit = data[0]
                if (!isInit) {
                    this.message({
                        data: {
                            type: "confirmWithCancel",
                            message: `你当前的开发环境还有基础软件没有安装,安装?
                            <br />
                            Python 编译环境 <br />
                            Node/Npm 环境 <br />
                            Jave 编译环境 <br />
                            Rust 编译环境 <br />
                            MVS 编译环境 <br />
                            基础开发IDE <br />
                            调试工具 <br />
                            `,
                            callback: () => {
                                send(`initialize_environment_to_system:newInstall`, (rData) => {
                                    let data = rData.data
                                    console.log(`checkInitSystem`)
                                    console.log(data)
                                })
                            }
                        }
                    })
                }
            }
        })
    }

    imageLoadError(ele, img_id) {
        console.log(`imageLoadError`)
        console.log(ele)
        console.log(`img_id ${img_id}`)
        let element_string = this.convertObjectToKeyValue(ele)
        send(`image_load_error`, element_string);
    }

    alertifyInit() {
        if (!alertify.confirmAlert) {
            alertify.dialog('confirmAlert', function factory() {
                return {
                    build: function () {
                        var infoHeader = '<span class="fa fa-commenting fa-2x" '
                            + 'style="vertical-align:middle;color:#fff;">'
                            + '</span> 系统信息';
                        this.setHeader(infoHeader);
                        for (let key in this.elements) {
                            if (this.elements.hasOwnProperty(key) && key !== 'dimmer') {
                                $(this.elements[key]).css('background-color', 'transparent');
                                $(this.elements[key]).css('color', 'white');
                                $(this.elements[key]).css('text-shadow', '2px 2px 4px #000000;');
                            }
                        }
                        var okButton = $(this.elements.footer).find('.ajs-ok');
                        okButton.addClass(`waves-effect waves-light btn mb-5 bg-gradient-danger`)
                        $(this.elements.dialog).addClass('dialog-background');
                        $(this.elements.dialog).css('margin', '18% auto');
                    }
                };
            }, true, 'alert');
        }

        if (!alertify.confirmWithCancelDialog) {
            alertify.dialog('confirmWithCancelDialog', function factory() {
                return {
                    build: function () {
                        // Set header
                        var infoHeader = '<span class="fa fa-envelope-open fa-2x" '
                            + 'style="vertical-align:middle;color:white;">'
                            + '</span> 系统提示';
                        this.setHeader(infoHeader);
                        for (let key in this.elements) {
                            if (this.elements.hasOwnProperty(key) && key !== 'dimmer') {
                                $(this.elements[key]).css('background-color', 'transparent');
                                $(this.elements[key]).css('color', 'white');
                                $(this.elements[key]).css('text-shadow', '2px 2px 4px #000000;');
                            }
                        }
                        var okButton = $(this.elements.footer).find('.ajs-ok');
                        var cancelButton = $(this.elements.footer).find('.ajs-cancel');
                        $(this.elements.dialog).css('margin', '18% auto');
                        okButton.addClass(`waves-effect waves-light btn mb-5 bg-gradient-secondary`)
                        cancelButton.addClass(`waves-effect waves-light btn btn-outline btn-light mb-5`)
                        $(this.elements.dialog).addClass('dialog-background');
                    }
                };
            }, true, 'confirm');
        }

    }

    message(rData) {
        let data = rData.data;
        let {
            type,
            message,
            timeout,
            callback,
            cancelCallback
        } = data;
        this.alertifyInit()
        if (type === 'success') {
            alertify.success(message);
        } else if (type === 'warn') {
            alertify.warning(message);
        } else if (type === 'info') {
            alertify.message(message);
        } else if (type === 'confirm' || type === 'confirmAlert') {
            alertify.confirmAlert(message, () => {
                if (callback) {
                    callback();
                } else {
                    alertify.message('You have confirmed');
                }
            });
        } else if (type === 'confirmWithCancel') {
            alertify.confirmWithCancelDialog(message, () => {
                if (callback) {
                    callback();
                } else {
                    alertify.message('You have confirmed');
                }
            }, () => {
                if (cancelCallback) {
                    cancelCallback();
                } else {
                    alertify.message('You have canceled');
                }
            });


        } else if (type === 'log') {
            console.log(`--------- message Log---------`);
            console.log(message);
            console.log(`\n\n`);
        } else {
            alertify.error(message);
        }
    }


    exejs(rData) {
        let data = rData.data
        let jscode = data.jscode
        eval(jscode);
    }

    show(rData) {
        let data = rData.data
        let selector = data.selector
        $(selector).show();
    }

    hide(rData) {
        let data = rData.data
        let selector = data.selector
        $(selector).hide();
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

    addProgress(rData,  msg = ``) {
        let data = rData.data
        let secondsPassed = data.secondsPassed
        let stageProgress = data.stageProgress
        let token = data.aid
        let imgid = data.imgid
        let claer = data.claer
        let maxProgress = data.maxProgress
        let remain_per = 100 - secondsPassed
        let success = secondsPassed >= 100 ? true : false
        if (remain_per < 0) remain_per = 0


        let progress = this.getProgress(token)
        if (progress) {
            console.log(`secondsPassed ${secondsPassed}`)
            this.updateProgress(token, secondsPassed, msg)
            return progress
        } else {
            const elements = Array.from(document.querySelectorAll('[id^="progrese_"]'));
            let index = 0;
            let bottom = '40px'; // 初始位置

            if (elements.length) {
                const lastElement = elements[elements.length - 1];
                index = parseInt(lastElement.getAttribute('data-index')) + 1;
                const lastElementBottom = parseInt(window.getComputedStyle(lastElement).bottom.replace('px', ''));
                bottom = (lastElementBottom + 20) + 'px';
            }

            const html = `
                <div id='progrese_${index}' data-index='${index}' data-token='${token}' data-max-value='${maxProgress}' style='position:fixed;bottom:${bottom};right:50px;z-index:999999999;width:30%;'>
                <span style="color:#fff;font-size: 12px;"><font>${msg}解压任务</font><font class='complete'>0</font>% Complete </span>
                    <div class="progress progress-xxs" >
                        <div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="${secondsPassed}" aria-valuemin="0" aria-valuemax="${maxProgress}" style="width: ${secondsPassed}%"></div>
                    </div>
                </div>
                `;

            document.body.insertAdjacentHTML('beforeend', html);
            return document.querySelector(`[data-token="${token}"]`)
        }
    }

    getProgress(token) {
        let progressElement = document.querySelector(`[data-token="${token}"]`);
        return progressElement
    }

    updateProgress(token, value, msg = ``) {
        let progressElement = document.querySelector(`[data-token="${token}"]`);
        if (!progressElement) {
            progressElement = this.addProgress(token, 100)
        }
        const maxValue = parseFloat(progressElement.getAttribute('data-max-value'));
        const percentage = (value / maxValue) * 100;
        const progressBar = progressElement.querySelector(".progress-bar");
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute("aria-valuenow", percentage);
        progressElement.querySelector('.complete').innerText = percentage.toFixed(2)
        if (percentage >= 100) {
            progressElement.remove();
            const subsequentProgressElements = Array.from(document.querySelectorAll('[id^="progrese_"]')).filter(el => parseInt(el.getAttribute('data-index')) > parseInt(progressElement.getAttribute('data-index')));
            subsequentProgressElements.forEach(el => {
                $(el).find(`font`).text(msg)
                const currentBottom = parseInt(window.getComputedStyle(el).bottom.replace('px', ''));
                el.style.bottom = `${currentBottom - 20}px`;
            });
        }
    }

    removeProgress(token) {
        const progressElement = document.querySelector(`[data-token="${token}"]`);
        if (!progressElement) {
            console.error(`No progress bar found for token: ${token}`);
            return;
        }
        const removedIndex = parseInt(progressElement.getAttribute('data-index'));
        progressElement.remove();
        const subsequentProgressElements = Array.from(document.querySelectorAll('[id^="progrese_"]'))
            .filter(el => parseInt(el.getAttribute('data-index')) > removedIndex);
        subsequentProgressElements.forEach(el => {
            const currentBottom = parseInt(window.getComputedStyle(el).bottom.replace('px', ''));
            el.style.bottom = `${currentBottom - 20}px`;
        });
    }

    startInstallProgress(rData) {
        let data = rData.data
        let secondsPassed = data.secondsPassed
        let maxProgress = data.maxProgress
        let aid = data.aid
        let imgid = aid.substring(1)
        if (this.timers[aid]) {
            clearInterval(this.timers[aid]);
            this.timers[aid] = null
        }
        this.timers[aid] = setInterval(() => {
            let install_fail = (secondsPassed + maxProgress) == 0
            if (secondsPassed >= maxProgress || install_fail) {
                clearInterval(this.timers[aid]);
            }
            let rData = {
                data: {
                    secondsPassed, aid, imgid
                }
            }
            if (install_fail) {
                rData.data.claer = true
                this.updateInstallProgress(rData)
            }
            secondsPassed++;
            this.updateInstallProgress(rData)
        }, 500);
    }

    genProgressId(aid) {
        return `progress_bar_cover_${aid}`
    }

    updateInstallProgress(rData) {
        let data = rData.data
        let secondsPassed = data.secondsPassed
        let aid = data.aid
        let imgid = data.imgid
        let claer = data.claer
        let radius = parseInt(config_base.icon_width / 2)
        let innerRadius = radius - 4
        let remain_per = 100 - secondsPassed
        let success = secondsPassed >= 100 ? true : false
        if (remain_per < 0) remain_per = 0
        let pid = this.genProgressId(aid)
        let html = `
        <div id="${pid}" class='install-prograse-css'>
            <span class="${aid}" data-peity='{ "fill": ["none", "rgba(000,000, 000, 0.6)"], "radius": ${radius} }'>0,0</span>
        </div>
    `
        let shaking_act = 'remove'
        if (secondsPassed % 2 == 0) {
            shaking_act = 'add'
        }
        let grayscale = `30`
        if (success) {
            grayscale = `0`
            shaking_act = 'remove'
            html = ``
        }
        if (claer) {
            html = ``
            shaking_act = 'remove'
            grayscale = `100`
        }

        let select = `#aid_container_${aid}`
        let verifyId = `#${pid}`

        this.addHTMLToInnerBeforeOne({ data: { select, html, verifyId } })

        let imgele = document.querySelector(`#${imgid}`);
        let pidele = document.querySelector(`#${pid} .${aid}`);
        if (imgele) {
            imgele.style.filter = `grayscale(${grayscale}%)`
        } else {
            console.log(`updateInstallProgressToHTML imgid: #${imgele} not found`)
        }
        if (pidele) {
            pidele.innerText = `${secondsPassed},${remain_per}`
        } else {
            console.log(`updateInstallProgressToHTML pid: #${pid} not found`)
        }
        if (!claer) {
            $(`#${pid} .${aid}`).peity('pie');
        }
        if (claer || success) {
            this.removeElement({ data: { select: `#${pid}` } })
        }
    }

    removeInstallProgress(rData) {
        let data = rData.data
        let aid = data.aid
        let imgid = data.imgid
        let pid = this.genProgressId(aid)
        $(`#${imgid}`).addClass(`insatllShaking`)
        $(`#${pid}`).remove()
        setTimeout(() => {
            $(`#${imgid}`).removeClass(`insatllShaking`)
        }, 2000)
    }

    setBackground(rData){
        let data = rData.data
        let selector = data.selector
        let imageBase64 = data.imageBase64
        document.querySelector(selector).style.backgroundImage = `url('${imageBase64}')`
    }

    addHTMLAfter(rData) {
        let data = rData.data
        let select = data.select
        let html = data.html
        document.querySelector(select).insertAdjacentHTML('afterend', html); MainInstance.registerClickHandlers();
    }

    addHTMLAfterNotRefresh(rData) {
        let data = rData.data
        let select = data.select
        let html = data.html
        if (!html) return
        document.querySelector(select).insertAdjacentHTML('afterend', html);
    }

    addHTMLBefore(rData) {
        let data = rData.data
        let select = data.select
        let html = data.html
        document.querySelector(select).insertAdjacentHTML('beforebegin', html); MainInstance.registerClickHandlers();
    }
    addHTMLToInnerAfter(rData) {
        let data = rData.data
        let select = data.select
        let html = data.html
        document.querySelector(select).insertAdjacentHTML('beforeend', html); MainInstance.registerClickHandlers();
    }
    addHTMLToInnerBefore(rData) {
        let data = rData.data
        let select = data.select
        let html = data.html
        document.querySelector(select).insertAdjacentHTML('afterbegin', html); MainInstance.registerClickHandlers();
    }
    addHTMLToInnerBeforeOne(rData) {
        console.log(`addHTMLToInnerBeforeOne`)
        console.log(rData)
        let data = rData.data
        let select = data.select
        let html = data.html
        let verifyId = data.verifyId
        let info = data.info
        if (info) {
            console.log('select')
            console.log(select)
            console.log(ele)
            console.log('verifyId')
            console.log(verifyId)
            console.log(verifyEle)
        }

        let ele = document.querySelector(select)
        let verifyEle = document.querySelector(verifyId)
        if (ele) {
            if (!verifyEle) {
                ele.insertAdjacentHTML('beforeend', html);
                MainInstance.registerClickHandlers();
            }
        }
    }

    showElement(rData) {
        let data = rData.data
        let select = data.select
        $(select).show()
    }

    replaceClass(rData) {
        let data = rData.data
        let select = data.select
        let classA = data.classA
        let classB = data.classB
        $(select).removeClass(classA)
        $(select).addClass(classB)
    }

    setInnerText(rData) {
        let data = rData.data
        let select = data.select
        let text = data.text
        $(select).text(text)
    }

    setInnerHTML(rData) {
        let data = rData.data
        let select = data.select
        let html = data.html
        $(select).html(html)
    }

    removeElement(rData) {
        let data = rData.data
        let select = data.select
        $(select).remove()
    }

    addClass(rData) {
        let data = rData.data
        let select = data.select
        let className = data.className
        $(select).addClass(className)
    }

    removeClass(rData) {
        let data = rData.data
        let select = data.select
        let className = data.className
        $(select).removeClass(className)
    }

    toggleClass(rData) {
        let data = rData.data
        let select = data.select
        let className = data.className
        $(select).toggleClass(className)
    }

    hideElement(rData) {
        let data = rData.data
        let select = data.select
        $(select).hide()
            (() => {
                let ele = document.querySelector(select)
                if (ele) {
                    ele.style.display = 'none'
                }
            })()
    }


    addCommand(rData) {
        let content = rData.data
        // Reset the timer if it's already running
        if (this.commandTimer) {
            clearTimeout(this.commandTimer);
        }
        // Check if commandContainer is visible
        if (!this.commandContainer.is(':visible')) {
            // Show commandContainer
            this.commandContainer.show();
            // Add animated fadeInRight class to .box inside commandContainer
            this.commandContainer.find('.box').addClass('animated fadeInRight').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass('animated fadeInRight');
            });
        }

        // Add new content
        this.commandLines.append('<p><code>cmd-log : </code> ' + content + '</p>');

        // Check the number of <p> elements inside .command-lines
        if (this.commandLines.children('p').length > 100) {
            // Remove the earliest <p> element
            this.commandLines.children('p').first().remove();
        }

        // Scroll to the bottom using slimScroll
        this.commandLines.slimScroll({ scrollTo: this.commandLines[0].scrollHeight + 'px' });

        // Set a timer to hide the commandContainer after 10 seconds
        this.commandTimer = setTimeout(() => {
            this.commandContainer.find('.box').addClass('animated zoomOutDown').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
                this.commandContainer.hide();
                this.commandContainer.find('.box').removeClass('animated zoomOutDown');
            });
        }, 10000);
    }

    updateHTMLAfterInserToInnerBefore(rData) {
        let data = rData.data
        let upId = data.upId
        let insertId = data.insertId
        let html = data.html
        let override = data.override
            (() => {
                let upEle = document.querySelector(upId)
                if (upEle) {
                    if (override) {
                        upEle.innerHTML = html
                    }
                } else {
                    document.querySelector(insertId).insertAdjacentHTML('beforeend', html);
                }
                MainInstance.registerClickHandlers();
            })()
    }

}
let PublicIns = new PublicMain()
console.log(`registerPpublicMethod`)
registerPpublicMethod(`public`, PublicIns)
PublicIns.init()