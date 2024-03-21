(() => {
    class Main {
        iconCache = {};
        totalLength = 0

        constructor() {
        }

        async init() {
            send('readIcons', async (rData) => {
                let data = rData.data
                let iconListHtmlAndIconsHtml = ``
                for (const groupname in data) {
                    let gList = data[groupname]
                    let gid,border
                    for (const softname in data[groupname]) {
                        gid = data[groupname][softname].gid
                        border = data[groupname][softname].border
                        break
                    }
                    if (gid) {
                        let giconid = this.generateGroupIconContainerId(gid)
                        let [upperHalfHtml, lowerPartHtml] = await this.creatIconListHTML(groupname, gList, gid, giconid,border);
                        iconListHtmlAndIconsHtml += upperHalfHtml
                        for (const softname in data[groupname]) {
                            let softConf = data[groupname][softname]
                            iconListHtmlAndIconsHtml += await this.generateIconHTML(groupname, softConf, gid)
                        }
                        iconListHtmlAndIconsHtml += lowerPartHtml
                    }
                }
                $(`#icons_container`).prepend(iconListHtmlAndIconsHtml)
            })

            send(`create_env_version.testLanguageVersionsAndShowHTML`, (rData) => {
                let data = rData.data
                let languages = data[0]
                for (const lang in languages) {
                    const { version, lan } = languages[lang];
                    if(version){
                        $(`#${lan}_field`).removeClass(`badge-primary-light`).addClass(`badge-success-light`);
                        $(`.${lan}_version`).text(`v${version}`)
                    }else{
                        $(`#${lan}_field`).removeClass(`badge-primary-light`).addClass(`badge-danger-light`);
                    }
                }
            })
        }

        generateGroupIconContainerId(gid) {
            let giconid = `iconid_${gid}`
            return giconid
        }

        getImgMargin() {
            let imgMargin = 10
            return imgMargin
        }

        get(exists) {
            return exists ? `` : `filter: grayscale(100%);`
        }

        async updateIconToHtml(rData) {
            let { groupname, softConf, icon_width, gid, img_id } = rData.data
            let gListLength = $(`#${img_id}`).children().length + 1;
            let n = gListLength / 3
            n = Math.ceil(n);
            let imgMargin = 10
            let w = (n * (imgMargin * 2 + icon_width)) + 20
            $(`#${gid}`).css("width", w + "px");
            await this.generateIconHTML(groupname, softConf, gid, true)
        }

        async generateIconHTML(groupname, softConf, gid, append = false) {
            let icon_width = config_base.icon_width
            let basename = softConf.basename
            let aid = softConf.aid
            let img_id = softConf.img_id
            let imgMargin = this.getImgMargin()
            let iconBase64 = softConf.iconBase64
            let target = softConf.target
            let imag_gray = softConf.isExist ? `` : `filter: grayscale(100%);`
            let maxWidth = `width:${icon_width + imgMargin}px;`
            let style = `${maxWidth};display:block;`
            let hideMaxStringLent = 8
            let titleClass = `softname_title_not_translate`
            let titleSubClass = ``
            let iconEvent = `oncontextmenu="window.appMenuManager.rightMouseMenu(event,this);" ondblclick="runExe(this)"`
            let imgStyle = `width: ${icon_width}px;${imag_gray}`
            let wdithStyle = `width: ${icon_width}px;`
            // console.log(softConf)
            if (basename.length > hideMaxStringLent) {
                titleClass = `softname_title`
                titleSubClass = `softname_titlelinear`
            }
            let icon_html2 = `
            <div data-aid="${aid}" id="aid_container_${aid}" class="aid_container aid_container_${aid}" style="position:relative;margin-bottom: 10px; margin-left: ${imgMargin}px; ${style} overflow: hidden;">
                <a href="javascript:;" class="text-center" style="display:block;width:100%;height:100%;" 
                data-imgid="${img_id}" 
                data-group="${groupname}" 
                data-parent_id="${gid}" 
                data-basename="${basename}" 
                data-wingetid="${softConf.winget_id}" 
                data-source_local="${softConf.source_local}" 
                data-default_install_dir="${softConf.default_install_dir}" 
                data-install_type="${softConf.install_type}" 
                id="${aid}" 
                data-exists="${softConf.isExist}" 
                data-exec="${target.replaceAll(/\\/g, "/")}" 
                ${iconEvent}
                ><div class="" style="">
                        <img class="avatar avatar-lg rounded-circle bg-warning-light" 
                        onerror="iconImageLoadError(this,this.id)" 
                        src="${iconBase64}" 
                        id="${img_id}" 
                        alt="${basename}" 
                        title="${basename}"
                        style="${imgStyle}" 
                        ></div>
                        <div class="">
                        <h6 class="mt-2 mb-0 softname_title">
                            <span class="${titleSubClass}">${basename}</span>
                        </h6>
                        </div>
                </a>
            </div>
            `
            if (append) {
                console.log(`document.querySelector("#${img_id}")`)
                console.log(icon_html2)
                document.querySelector(`#${img_id}`).insertAdjacentHTML('afterbegin', icon_html2);
                // $(`#${giconid}`).append(icon_html2);
            }
            return icon_html2
        }

        getListIconWidth(gListLength) {
            let n = gListLength / 3
            n = Math.ceil(n);
            let imgMargin = this.getImgMargin()
            let w = (n * (imgMargin * 2 + config_base.icon_width)) + 20
            return w
        }

        async creatIconListHTML(groupname, gList, gid, giconid,border) {
            let gListLength = typeof gList === "object" ? Object.keys(gList).length : gList
            let w = this.getListIconWidth(gListLength)
            let css = `width:${w}px;`
            let style_width = css
            let app_region = `-webkit-app-region: no-drag;-webkit-user-select: none;`
            let margin = `margin-right: 30px;`
            let upperHalfHtml = `
                <div class="box bl-5 ${border} rounded pull-up icon-list-box" id="${gid}" style="${app_region}${style_width}${margin};position: relative;background:none;">
                    <div class="box-body" style="padding:0;">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center pr-2 justify-content-between">
                                <h4 class="font-weight-500 softname_group_title" style="color:#fff;">
                                    <span class="softname_group_sub_title">${groupname}</span>
                                </h4>
                                <div class="dropdown">
                                    <a data-toggle="dropdown" href="#" class="px-10 pt-5"><i
                                            class="ti-more-alt"></i></a>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <a class="dropdown-item" href="#"><i class="ti-import"></i>
                                            Import</a>
                                        <a class="dropdown-item" href="#"><i class="ti-export"></i>
                                            Export</a>
                                        <a class="dropdown-item" href="#"><i class="ti-printer"></i>
                                            Print</a>
                                        <div class="dropdown-divider"></div>
                                        <a class="dropdown-item" href="#"><i class="ti-settings"></i>
                                            Settings</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center justify-content-between mt-10">
                            <div class="d-flex" id="${giconid}" style="flex-wrap: wrap; display: flex; justify-content: flex-start;">
                `

            let lowerPartHtml = `
                            </div>
                            </div>
                        </div>
                        <button type="button" class="waves-effect waves-circle btn btn-circle btn-outline" style="position: absolute;right: 5px;bottom: 5px;" ><i class="mdi mdi-plus"></i></button>
                    </div>
            `
            return [upperHalfHtml, lowerPartHtml]
        }


    }
    let main = new Main()
    main.init()
    registerPpublicMethod(main)
})()



