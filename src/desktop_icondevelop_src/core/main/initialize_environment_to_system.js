// const { fork } = require('child_process');
const fs = require('fs');
const os = require('os')
const path = require('path');
// const { start } = require("repl");
// const ftp = require('basic-ftp');
// const request = require('request');
const {
    // app,
    // config_base,
    events,
} = require('../component/comlib/component.js');
const {
    stringUnit,
    fileUnit,
    utilUnit,
    frameUnit,
} = require('../component/comlib/unit.js');
const {
    httpWidget,
    configWidget,
    // shortcutRegistrationWidget,
    winapiWidget,
    wingetWidget,
    messageWidget,
    zipWidget,
    htmlWidget,
    shortcutIconWidget,
} = require('../component/comlib/widget.js');
const { config, config_base } = require('../component/comlib/config.js');
const create_env_version = require('./create_env_version.js');


class Main {
    awaitExtraZips = []
    alreadyExtraZips = []
    public_updatejson = `.public_update.json`
    public_updatedir = `soft_backup`
    para_tryrunasadmin = `tryrunasadmin`
    spik_soft_groups = [`adobe`, `finance`, `files`]
    spik_soft_folders = [`tb`, `git`]
    spik_softs = []
    winget_ids = [
        // {
        //     "basename": "PeaZip",
        //     "winget_id": "Giorgiotani.Peazip",
        //     "soruce_url": "https://github.com/peazip/PeaZip/releases/download/9.4.0/peazip-9.4.0.WIN64.exe",
        //     'default_dir': "C:\\Program Files",
        //     // "icon":"",
        // },
        {
            "basename": "Bandizip",
            "winget_id": "Bandisoft.Bandizip",
            "soruce_url": "https://dl.bandisoft.com/bandizip.std/BANDIZIP-SETUP-STD-X64.EXE",
            'default_dir': "",
            // "icon":"",
        },
        // {
        //     "basename": "NanaZip",
        //     "winget_id": "M2Team.NanaZip"
        // },
        {
            "basename": "Git",
            "winget_id": "Git.Git",
            "soruce_url": " https://github.com/git-for-windows/git/releases/download/v2.41.0.windows.3/Git-2.41.0.3-64-bit.exe",
            'default_dir': "C:\\Program Files",
            "icon": "",
        },
        {
            "basename": "Notepad++",
            "winget_id": "Notepad++.Notepad++",
            "soruce_url": " https://github.com/notepad-plus-plus/notepad-plus-plus/releases/download/v8.5.6/npp.8.5.6.Installer.x64.exe",
            "icon": "",
        }
        ,
        {
            "basename": "WPS Office",
            "winget_id": "Kingsoft.WPSOffice",
            "soruce_url": "https://official-package.wpscdn.cn/wps/download/WPS_Setup_15358.exe",
            'default_dir': "C:\\Program Files",
            "group": "office",
            "icon": "ksolaunch.exe",
        }
        ,
        {
            "basename": "WeChat",
            "winget_id": "Tencent.WeChat",
            "soruce_url": "",
            'default_dir': "C:\\Program Files",
            "group": "office",
            "icon": "WeChat.exe",
        }
    ]

    async checkInitSystem(callback) {
        let isInstall = true
        if (winapiWidget.hasUserData(`install.create_appdir`)) {
            isInstall = false
        }
        create_env_version.testLanguageVersionsAndShowHTML((veersion) => {
            console.log(veersion)
            callback(false)
        })
        if (!winapiWidget.hasUserData(`install.create_appdir`)) {

        }
        // callback(false)
        // await this.addRunAsAdministor()
        // this.backupOldAppsDir()
        // this.junctionFolder()
        // this.installBaseApps()

        // this.installCommonApps(iconsRemoteJSON)
        // this.deployDevelopmentEnvironment()
        // let desktopDir = winapiWidget.getDesktopDir()
        // let bat_filecontent = this.getIntInstallCommand()
        // fileUnit.saveFile(path.join(desktopDir, 'initCommand.bat'), bat_filecontent)
    }


    async newInstall() {
        httpWidget.sendToWebSocket('public.message',{
            type:"confirm",
            message:"Wait"
        })
        return 
        if (!this.isAdmin()) {
            messageWidget.error(`当前并非管理员模式,尝试使用管理员模式重启.`)
            let para_s = frameUnit.getParameter(`-s`)
            if (para_s != this.para_tryrunasadmin) {
                setTimeout(() => {
                    this.tryRunAsAdmin()
                }, 1000)
            } else {
                messageWidget.error(`当前系统需要初始化，请手动使用管理员启动：<br />程序右键->高级设置->(勾选)运行管理员模式`)
            }
            return
        }
        await this.addRunAsAdministor()

        this.backupOldAppsDir()
        this.junctionFolder()
        // this.installBaseApps()

        this.deployDevelopmentEnvironment()
        return
        let iconsRemoteJSON = await shortcutIconWidget.readIconsCache()

        shortcutIconWidget.generateIconShortcut(iconsRemoteJSON)

        this.installCommonApps(iconsRemoteJSON)
        // let userDir = stringUnit.to_windowspath(winapiWidget.getUserDir())
        let desktopDir = winapiWidget.getDesktopDir()
        // let majorVersion = winapiWidget.getDefaultEnvVersion();
        // let public_config = messageWidget.get_config()
        // let local_envdir = public_config.local_envdir
        // let powershell = stringUnit.to_windowspath(fileUnit.findFile(`C:/Windows/System32/WindowsPowerShell`, `powershell.exe`))
        // let soft_localpath = stringUnit.to_windowspath(public_config.soft_localpath)
        let bat_filecontent = this.getIntInstallCommand()
        // fileUnit.saveFile(path.join(desktopDir, 'RunAsAdministor.ps1'), iniSetCmds.join('\n'))
        fileUnit.saveFile(path.join(desktopDir, 'initCommand.bat'), bat_filecontent)
        // fileUnit.saveFile(path.join(desktopDir, 'InitEnviroment.bat'), bat_filecontent)


        let install_app = [
            "git",
            "bundizip",
            "SVNtest",
        ]
        // this.auto_install(install_app)
        let backups = []
        let pubfile = []
        // this.auto_git_ssh(pubfile)
    }

    closePincodeLoginWin11() {
        let reg = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\PasswordLess\\Device'
        winapiWidget.setRegistry(reg, 0,(listResult)=>{
            console.log(listResult)
        })
    }

    tryRunAsAdmin() {
        let main_exe = fileUnit.findFileByCurrentDirExtname(fileUnit.getRoot(), '.exe')
        messageWidget.success(`${main_exe}`)
        if (main_exe.length) {
            main_exe = main_exe[0]
            let para_s = frameUnit.getParameter(`-s`)
            if (para_s == this.para_tryrunasadmin) {
                if (!this.isAdmin()) {
                    messageWidget.error(`尝试使用管理员启动失败：<br />程序右键->高级设置->(勾选)运行管理员模式`)
                } else {
                    winapiWidget.exec_asadmin(main_exe, null, null, `-s ${this.para_tryrunasadmin}`)
                    events.close()
                }
            }
        }
    }

    async installCommonApps(iconsRemoteJSON) {
        if (!iconsRemoteJSON) iconsRemoteJSON = this.MergeRemoteIconFiles();
        for (const soft_grouname in iconsRemoteJSON) {
            if (this.spik_soft_groups.includes(soft_grouname.toLowerCase())) {
                continue;
            }
            let soft_list = iconsRemoteJSON[soft_grouname];
            for (let softname in soft_list) {
                let softConfig = soft_list[softname];
                let target = softConfig['target'];
                let basename = softConfig['basename'];
                let sPath = softConfig['path'];
                let soft_folder = fileUnit.getLevelPath(sPath, 2)
                if (this.spik_soft_folders.includes(soft_folder.toLowerCase())) {
                    continue;
                }
                if (this.spik_softs.includes(basename.toLowerCase())) {
                    continue;
                }
                let localDrive = fileUnit.getDrive(target);
                if (localDrive == 'c') {
                    continue;
                }
                let source_local = softConfig.source_local;
                let winget_id = softConfig.winget_id;
                if (winget_id) {
                    await this.installByWingetId(softConfig);
                } else if (source_local) {
                    await this.installByWingetInstallPack(softConfig, soft_grouname);
                } else {
                    await this.installByUnzipRemote(softConfig, soft_grouname);
                }
            }
        }
    }

    installByWingetInstallPack(softConfig, soft_grouname) {
        return new Promise((resolve, reject) => {
            wingetWidget.installByInstallPack(softConfig, silent, (err) => {
                resolve();
            });
        }).catch(() => { });
    }


    installByWingetId(softConfig) {
        return new Promise((resolve, reject) => {
            let silent = true
            wingetWidget.installById(softConfig, silent, (err) => {
                resolve();
            });
        }).catch(() => { });
    }

    installByUnzipRemote(softConfig, soft_grouname) {
        return new Promise((resolve, reject) => {
            wingetWidget.installByUnzipRemote(softConfig, soft_grouname, (err) => {
                resolve();
            });
        }).catch(() => { });
    }

    backupOldAppsDir() {
        let config = configWidget.get_config()
        let soft_install_path = config.soft_localpath
        if (winapiWidget.hasUserData(`install.create_appdir`) && fileUnit.isDir(soft_install_path)) {
            return
        }
        this.backupOldDir(soft_install_path, true)
    }

    backupOldDir(backupDir, one = true) {
        if (one) {
            if (winapiWidget.hasAndAddListUserData(`install.backupDir`, backupDir) && fileUnit.isDir(backupDir)) {
                console.log('already')
                return
            }
        }
        let backupDir_bak = path.join(backupDir + '_bak' + stringUnit.createTimestamp())
        if (fileUnit.isDir(backupDir)) {
            fileUnit.rename(backupDir, backupDir_bak)
            fileUnit.mkdir(backupDir)
        }
    }

    installBaseApps() {
        const wingetIds = this.winget_ids.map(item => item.winget_id);
        wingetWidget.queryInstalled(wingetIds).then((unInstallWingetIds) => {
            this.winget_ids.forEach((winget_obj) => {
                if (unInstallWingetIds.includes(winget_obj.winget_id)) {
                    wingetWidget.installByConfig(winget_obj)
                } else {
                    console.log(`${winget_obj.winget_id} installed`)
                }
            })
        })
    }

    junctionFolder() {
        // if (winapiWidget.hasAndSetUserData('install.junctionFolder')) {
        //     return true
        // }
        console.log(`junctionFolder`)
        let config = configWidget.get_config()
        let soft_link_variable = config.soft_link_variable
        let userDir = winapiWidget.getUserDir()
        const lines = soft_link_variable.split(/[\r\n]+/);
        lines.map(line => {
            line = line.trim();
            line = line.replace(/\%UserProfile\%/g, userDir);
            let line_split = line.split(`->`);
            if (line_split.length > 1) {
                let firstPart = line_split[0];
                let secondPart = line_split[1];
                firstPart = firstPart.trim();
                secondPart = secondPart.trim();
                if (secondPart) {
                    secondPart = path.join(config.soft_localpath, secondPart)
                    console.log(`src : ${secondPart} to ${firstPart}`)
                    fileUnit.symlink(secondPart, firstPart, true, true)
                }
            }
        })
        messageWidget.success(`Soft link created successfully`)
    }

    getIntInstallCommand(powershell, j = '\n') {
        let majorVersion = winapiWidget.getDefaultEnvVersion();
        let public_config = configWidget.get_config()
        let local_envdir = public_config.local_envdir
        let npm_exe = stringUnit.to_windowspath(path.join(path.join(local_envdir, majorVersion.node), 'npm'))
        let cnpm_exe = stringUnit.to_windowspath(path.join(path.join(local_envdir, majorVersion.node), 'cnpm'))
        let iniSetCmds = [
            `Set-ExecutionPolicy RemoteSigned`,
            // `${powershell} Write-Host "已设置执行策略为RemoteSigned。"`,
            // `${powershell} Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`,
            // `${powershell} Write-Host "为当前用户永久更改执行策略:。"`,
            // `${powershell} Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`,
            // `${powershell} Write-Host "为进程设置了绕过执行策略。"`,
            // `C:\\Windows\\System32\\Dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart`,
            // `${powershell} Write-Host "已启用Microsoft-Windows-Subsystem-Linux功能。"`,
            // `C:\\Windows\\System32\\Dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart`,
            // `${powershell} Write-Host "已启用VirtualMachinePlatform功能。"`,
            `npm config set registry http://mirrors.cloud.tencent.com/npm/`,
            // `${powershell} Write-Host "已设置npm镜像源为Tencent。"`,
            `npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"`,
            // `${powershell} Write-Host "已设置sharp的二进制主机。"`,
            `npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"`,
            `npm config set prefix $(pwd)`,
            // `${powershell} Write-Host "已设置sharp-libvips的二进制主机。"`,
            `npm install sharp -g`,
            // `${powershell} Write-Host "已全局安装sharp。"`,
            `npm install cnpm -g`,
            // `${powershell} Write-Host "已全局安装cnpm。"`,
            `npm install electron -g`,
            // `${powershell} Write-Host "已使用cnpm全局安装electron。"`,
            `npm install yarn -g`,
            // `${powershell} Write-Host "已全局安装yarn。"`,
            `npm install expo-cli -g`,
            // `${powershell} Write-Host "已全局安装expo-cli。"`,
            `npm install ncu -g`,
            // `${powershell} Write-Host "已全局安装ncu。"`,
            `cmd`
        ]
        if (j) {
            iniSetCmds = iniSetCmds.join(j)
        }
        return iniSetCmds
    }

    optionalfeatures() {
        let windows_opreators = [
            "control.exe /name Microsoft.Language",
            "optionalfeatures",
            "control.exe folders",
            "git config --system http.sslverify false",
        ]
        utilUnit.exec_cmds(windows_opreators, () => {

        }, (msg, stderr, err) => {
            messageWidget.log(msg)
        })
    }

    getRemoteUrl(suffixUrl) {
        let remote_url = configWidget.get_config(`setting_soft_remote_update_url`)
        if (!remote_url.endsWith('/')) {
            remote_url = remote_url + '/'
        }
        remote_url = remote_url + this.public_updatedir
        if (!remote_url.endsWith('/')) {
            remote_url = remote_url + '/'
        }
        if (suffixUrl) {
            remote_url = httpWidget.joinURL(remote_url, suffixUrl)
        }
        return remote_url
    }

    async getRemoteUpdateconfig() {
        let remote_url = this.getRemoteUrl()
        remote_url = httpWidget.joinURL(remote_url, this.public_updatejson)
        let updatejson = null
        try {
            updatejson = await httpWidget.https_get(remote_url)
            updatejson = JSON.parse(updatejson)
            messageWidget.success(`远程目录读取成功: ${remote_url}`)
        } catch (err) {
            messageWidget.warn(`获取远程软件列表错误, ${remote_url}, ${stringUnit.toString(err)}`)
        }
        return {
            updatejson, remote_url
        }
    }

    async initEnvPath() {
        if (winapiWidget.hasAndSetUserData(`install.initEnvPath`)) {
            return
        }
        let config = configWidget.get_config()
        let local_envdir = config.local_envdir
        let bin_dirs = ["bin", "scripts", ".cargo"]
        let sp_env = ["python", "environments", "node"]
        let envs = fileUnit.scanDir(local_envdir)
        let set_envs = []
        envs.forEach((dir) => {
            let sub_envs = fileUnit.scanDir(dir)
            let base_dir = path.basename(dir)
            if (base_dir != '.tmp') {
                let base_dir_low = base_dir.toLocaleLowerCase()
                sp_env.forEach((bin_dir) => {
                    if (base_dir_low.startsWith(bin_dir)) {
                        set_envs.push(dir)
                    }
                })
                sub_envs.forEach((sub_dir) => {
                    let base_sub_dir = path.basename(sub_dir)
                    let sub_dir_low = base_sub_dir.toLocaleLowerCase()
                    bin_dirs.forEach((bin_dir) => {
                        if (sub_dir_low.startsWith(bin_dir)) {
                            set_envs.push(sub_dir)
                        }
                    })
                })
            }
        })
        await winapiWidget.setPathEnv(set_envs)
    }


    async deployDevelopmentEnvironment(callback) {

        htmlWidget.startProgress( 0, 20,`tese`,)
        return
        let config = configWidget.get_config()
        let remote_update_url = config.setting_soft_remote_update_url
        let install_path = config.local_envdir

        let key = `install.installedCompilelangs`
        let zipQueueKey = stringUnit.create_id()



        this.backupOldDir(install_path, true)
        let lang_compiler_url = httpWidget.joinURL(remote_update_url, `icons_config/lang_compiler.json`)
        let lang_compiler_json = await httpWidget.getJSON(lang_compiler_url)
        let installCount = 0
        for (let soft_name in lang_compiler_json) {

            let soft_config = lang_compiler_json[soft_name]
            let filename = soft_config.filename
            let soft_downurl = httpWidget.joinURL(remote_update_url, `lang_compiler/${filename}`)
            if (!winapiWidget.hasListUserData(key, filename)) {
                this.showEnvironmentInstall(filename)
                installCount++
                zipWidget.putQueueCallback(async () => {
                    await this.initEnvPath()
                    if (callback) callback()
                }, zipQueueKey)
                httpWidget.getFileAndUnzip(soft_downurl, install_path, (dest, out, usetime) => {
                    winapiWidget.addListUserData(key, filename)
                })
            }
        }
        if (installCount == 0) {
            await this.initEnvPath()
            if (callback) callback()
        }
    }

    showEnvironmentInstall(soft_name) {
        soft_name = soft_name.toLowerCase()
        let select
        if (soft_name.startsWith(`python`)) {
            select = `python`
        } else if (soft_name.startsWith(`node`)) {
            select = `node`
        } else if (soft_name.startsWith(`java`)) {
            select = `java`
        } else if (soft_name.startsWith(`go`)) {
            select = `go`
        } else if (soft_name.startsWith(`rust`)) {
            select = `rust`
        } else if (soft_name.startsWith(`groovy`)) {
            select = `groovy`
        }
        if (select) {
            select = `#${select}_field`
            htmlWidget.replaceClass(select, `badge-primary-light`, `badge-info-light`)
            htmlWidget.showElement(select)
        }
    }

    async initApplications(applications, install_path, remote_subdir) {
        let download_tmp_dir = path.join(install_path, '.tmp')
        fileUnit.mkdir(download_tmp_dir)
        let all_softlen = Object.keys(applications).length
        for (let application_name in applications) {
            let application_config = applications[application_name]
            let zipFileName = application_config.zipFileName
            let fileName = application_config.fileName
            let installType = application_config.installType
            let softCheckDir = path.join(install_path, fileName)
            if (!fileUnit.isDir(softCheckDir)) {
                let remote_url = this.getRemoteUrl(remote_subdir + '/' + zipFileName)
                messageWidget.success(`开始部署 : ${softCheckDir}`)
                let filename = await httpWidget.download(remote_url, download_tmp_dir)
                this.awaitExtraZips.push(filename)
                messageWidget.success(`下载成功 : ${filename}`)
                // const softDownUrl = httpWidget.joinURL(remote_url, zipFileName)
                let zip_name = path.basename(filename)
                fileUnit.unzip_7z(filename, install_path, () => {
                    this.alreadyExtraZips.push(zip_name)
                    messageWidget.success(`部署成功 :${zip_name} (${this.alreadyExtraZips.length}/${all_softlen})`)
                    fileUnit.delete(filename)
                })
            }
        }
    }

    async auto_git_ssh(config) {
        const username = os.userInfo().username;
        const folderPath = `${config}/${username}`
        try {
            const files = fs.readdirSync(folderPath);
            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                const stat = fs.statSync(filePath);
                if (files.length === 0) {
                    messageWidget.log("This Folder is Null!");
                }
                else if (stat.isDirectory() && file === '.ssh') {
                    if (fs.existsSync(`${folderPath}/.ssh/id_ed25519`)) {
                        if (fs.existsSync(`${folderPath}/.ssh/id_ed25519.pub`)) {
                            messageWidget.log("Git publickey is OK!");
                            return false
                        }
                    }
                } else {
                    let targetDir = `${folderPath}/.ssh`
                    fs.mkdir(targetDir, { recursive: true }, (err) => {
                        if (err) {
                            console.log(`Error: ${err}`);
                        } else {
                            // console.log(`Folder ${'.ssh'} Creat!`);
                            this.moveFiles(targetDir)
                            return false
                        }
                    });

                }
            });
        } catch (err) {
            console.error(err, "Not defind '.ssh file!");
        }
    }

    async auto_install(folderPath) {
        try {
            // 遍历文件夹中的所有文件
            const files = fs.readdirSync(folderPath);
            // 遍历每一个文件
            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                fs.stat('D:/Test', (err, stats) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if (stats.isDirectory()) {
                        console.log('Yes');
                    }
                    // 判断是否为exe文件
                    else if (path.extname(file) === '.exe') {
                        // console.log('ExePath:', filePath);
                        // let targetFolderPath = filePath
                        // winget.query_exe(targetFolderPath)
                        console.log(`Skipping ${filePath}`);
                    }
                    // 判断是否为zip文件
                    else if (path.extname(file) === '.zip') {
                        // console.log('ZipPath:', filePath);
                        this.unzipSync(zipFilePath)
                    }
                });
            });
        } catch (err) {
            console.error(err);
        }
        return
    }

    async addRunAsAdministor() {
        let runAdminAs = {
            "HKEY_CLASSES_ROOT\\Directory\\shell\\runas": {
                "": { type: "REG_SZ", value: "RunAsAdministrator", },
                "HasLUAShield": { type: "REG_SZ", value: "", },
            },
            "HKEY_CLASSES_ROOT\\Directory\\Background\\shell\\runas": {
                "": { type: "REG_SZ", value: "RunAsAdministrator", },
                "HasLUAShield": { type: "REG_SZ", value: "", },
            },
            "HKEY_CLASSES_ROOT\\Drive\\shell\\runas": {
                "": { type: "REG_SZ", value: "RunAsAdministrator", },
                "HasLUAShield": { type: "REG_SZ", value: "", },
            },
            "HKEY_CLASSES_ROOT\\Directory\\shell\\runas\\command": {
                "": { type: "REG_SZ", value: "cmd.exe /s /k pushd \"%V\"", },
            },
            "HKEY_CLASSES_ROOT\\Directory\\Background\\shell\\runas\\command": {
                "": { type: "REG_SZ", value: "cmd.exe /s /k pushd \"%V\"", },
            },
            "HKEY_CLASSES_ROOT\\Drive\\shell\\runas\\command": {
                "": { type: "REG_SZ", value: "cmd.exe /s /k pushd \"%V\"", },
            },
            "HKEY_CLASSES_ROOT\\Msi.Package\\shell\\runas": {
                "": { type: "REG_SZ", value: "MsiRunAsAdministrator", },
            },
            "HKEY_CLASSES_ROOT\\Msi.Package\\shell\\runas\\command": {
                "": { type: "REG_SZ", value: "msiexec /i \"%1\"", },
            },
        }
        for (let key in runAdminAs) {
            let value = runAdminAs[key]
            try{
                winapiWidget.setRegistry(key, value)
            }catch(e){

            }
        }
    }

    install_visualstudio() {

    }

    isAdmin() {
        const system32Dir = process.env.SystemRoot + '\\System32';
        const dirPath = path.join(system32Dir, '$desktop_icons');
        const filePath = path.join(dirPath, '.adminstrations');
        // let message
        try {
            // message = '管理员模式'
            if (fs.existsSync(dirPath)) {
                fs.writeFileSync(filePath, "isAdmin=true")
                // messageWidget.success(message)
                return true
            }
            fs.mkdirSync(dirPath, { recursive: true })
            messageWidget.success(message)
            return true
        } catch (err) {
            // console.log(err)
            // message = '请以管理员模式运行'
            // messageWidget.warn(message)
            return false
        }
    }
}


module.exports = new Main()