// const utilFunc = require("../tools/utilUnit.js")
// const { fork } = require('child_process');
// const fs = require('fs');
// const os = require('os')
const path = require('path');
// const { start } = require("repl");
// const ftp = require('basic-ftp');
const { execSync, exec } = require('child_process');

const {
	// frameUnit,
    fileUnit,
} = require('../component/comlib/unit.js');
const {
	configWidget,
	winapiWidget,
    messageWidget,
    zipWidget,
} = require('../component/comlib/widget.js');

class Main {
    backuping = false
    exclude_softs = [
        "^Adobe",
        "^Telegram",
        "FirefoxTb",
        "Tb",
    ]
    exclude_soft_type = [
        "^Adobe",
        "Files",
        "finance",
    ]

    all_backup_zipprocessdoen() {
        this.backuping = false
        messageWidget.success(`后台软件备份完毕`)
    }

    is_exclude(arr, softname) {
        softname = softname.toLowerCase()
        for (let i = 0; i < arr.length; i++) {
            let str = arr[i]
            if (str.startsWith('^')) {
                str = str.substring(1)
                str = str.toLowerCase()
                if (softname.startsWith(str)) {
                    return true
                }
            } else {
                if (str == softname) {
                    return true
                }
            }
        }
        return false
    }

    async backup_listen(IconFinder) {
        if (this.backuping) {
            return
        }
        this.backuping = true

        let public_config = configWidget.get_config()
        let bakup_path = public_config.setting_soft_local_bakup_path

        let softConfig = IconFinder.readIconJSONByLocal()
        // this.backup_softdirs( bakup_path, softConfig)
        // this.backup_lang_compiler(bakup_path, public_config,)
        await this.backup_icons(bakup_path, softConfig)
    }

    backup_lang_compiler(bakup_path, public_config) {
        bakup_path = path.join(bakup_path, 'lang_compiler')
        let local_envdir = public_config.local_envdir
        zipWidget.compressDirectory(local_envdir, bakup_path, `system_backup`, () => {
            this.all_backup_zipprocessdoen()
        })
    }

    backup_softdirs(bakup_path, softConfig) {
        bakup_path = path.join(bakup_path, 'applications')
        for (const icon_type in softConfig) {
            let icon_sub_list = softConfig[icon_type]
            if (this.is_exclude(this.exclude_soft_type, icon_type)) {
                continue
            }
            for (const soft_lnkname in icon_sub_list) {
                let soft_info = icon_sub_list[soft_lnkname]
                let soft_basename = soft_info[`basename`]
                if (this.is_exclude(this.exclude_softs, soft_basename)) {
                    continue
                }
                let soft_path = soft_info[`path`]
                let soft_basedir = path.basename(soft_path)
                if (this.is_exclude(this.exclude_softs, soft_basedir)) {
                    continue
                }
                let soft_dir = path.dirname(soft_path)
                let soft_dirbasename = path.basename(soft_dir)
                if (this.is_exclude(this.exclude_softs, soft_dirbasename)) {
                    continue
                }
                if (fileUnit.isDrive(soft_dir, 'c')) {
                    continue
                }
                let sortRootDir = fileUnit.slicePathLevels(soft_dir, 2)
                zipWidget.putZipQueueTask(sortRootDir, bakup_path, `system_backup`, () => {
                    this.all_backup_zipprocessdoen()
                })
            }
        }
    }

    async backup_icons(bakup_path, iconCache) {
        bakup_path = path.join(bakup_path, 'icons_config')
        bakup_path = path.join(bakup_path, 'icons.json')
        let backIconBack = {}
        // 双层遍历
        for (let category in iconCache) {
            if (this.is_exclude(this.exclude_soft_type, category)) {
                continue
            }
            if (!backIconBack[category]) backIconBack[category] = {}
            for (let iconName in iconCache[category]) {
                if (this.is_exclude(this.exclude_softs, iconName)) {
                    continue
                }
                if (!backIconBack[category][iconName]) backIconBack[category][iconName] = iconCache[category][iconName]
            }
        }
        fileUnit.saveJSON(bakup_path, backIconBack)
    }

    backup_wsl() {
        let public_config = configWidget.get_config();
        let backup_path = public_config.setting_soft_local_bakup_path;
        backup_path = path.join(backup_path, 'wsl_backup');
        fileUnit.mkdir(backup_path)
        fileUnit.cleanOldFiles(backup_path)

        const date = new Date();
        const timestamp = date.toISOString().replace(/:/g, '-').slice(0, -5);
        winapiWidget.getWslDistributes((distros) => {

            distros.forEach(distro => {
                const exportFile = path.join(backup_path, `${distro}_${timestamp}.tar`);
                let cmd = `wsl --export ${distro} "${exportFile}"`
                exec(cmd, (str, err, ero) => {
                    if (str) {
                        console.log(str)
                    }
                    if (err) {
                        console.log(err)
                    }
                    if (ero) {
                        console.log(ero)
                    }
                });
            });
        });
    }

}


module.exports = new Main()