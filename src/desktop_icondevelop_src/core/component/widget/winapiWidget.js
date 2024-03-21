
// 查询是否安装freamwork
// `Get-ItemPropertyValue -LiteralPath 'HKLM:SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full' -Name Release
// `
// 开启
// `DISM /Online /Enable-Feature /FeatureName:NetFx3 /All`
// `
// 1.0	HKLM\Software\Microsoft\.NETFramework\Policy\v1.0\3705	Install REG_SZ 等于 1
// 1.1	HKLM\Software\Microsoft\NET Framework Setup\NDP\v1.1.4322	Install REG_DWORD 等于 1
// 2.0	HKLM\Software\Microsoft\NET Framework Setup\NDP\v2.0.50727	Install REG_DWORD 等于 1
// 3.0	HKLM\Software\Microsoft\NET Framework Setup\NDP\v3.0\Setup	InstallSuccess REG_DWORD 等于 1
// 3.5	HKLM\Software\Microsoft\NET Framework Setup\NDP\v3.5	Install REG_DWORD 等于 1
// 4.0 客户端配置文件	HKLM\Software\Microsoft\NET Framework Setup\NDP\v4\Client	Install REG_DWORD 等于 1
// 4.0 完整配置文件	HKLM\Software\Microsoft\NET Framework Setup\NDP\v4\Full	Install REG_DWORD 等于 1
// `

// const { fork } = require('child_process');
const fs = require('fs');
const os = require('os')
const path = require('path');
const regedit = require('regedit').promisified;
// const { start } = require("repl");
// const ftp = require('basic-ftp');
// const request = require('request');
const { execSync, exec } = require('child_process');
const { config_base, config } = require('../comlib/config.js');
const utilUnit = require('../unit/utilUnit.js');
const fileUnit = require('../unit/fileUnit.js');
const stringUnit = require('../unit/stringUnit.js');

// const htmlWidget = require('../widget/htmlWidget.js');
// const httpWidget = require('../widget/httpWidget.js');
// const winapiWidget = require('../widget/winapiWidget.js');
// const shortcutIconWidget = require('../widget/shortcutIconWidget.js');
// const zipWidget = require('../widget/zipWidget.js');
const messageWidget = require('../widget/messageWidget.js');

class WindowsAPI {
    pathKey = 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment'
    install_queue = []
    userDataFile = 'userData.json';


    constructor() {
    }



    getMainExe(callback) {
        fs.readdir(fileUnit.get_root(), (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                if (callback) callback([])
                return
            }
            const exeFiles = files.filter(file => path.extname(file).toLowerCase() === '.exe');
            if (callback) callback(exeFiles)
        });
    }

    setstartup() {
        this.getMainExe((apps) => {
            if (apps.length) {
                let app = apps.pop()
                const updateExe = path.resolve(path.join(fileUnit.get_root(), app));

                try {
                    app.setLoginItemSettings({
                        openAtLogin: true, // 设置为 true 启用自动启动
                        openAsHidden: true, // 隐藏启动窗口（可选）
                        path: updateExe, // Update.exe 的完整路径
                    });
                } catch (e) {
                    console.error('Error setting login item:', e);
                }
            }
        })
    }

    isAppInLoginItems() {
        const settings = this.app.getLoginItemSettings()
        return settings.openAtLogin === true
    }

    checkAdmin(callback) {
        if (!this.isAdmin()) {
            messageWidget.error(`请以管理员模式运行,(右键:管理员运行.)`)
            setTimeout(() => {
                this.checkAdmin(callback)
            }, 3000)
        } else {
            if (callback) callback()
        }
    }

    runAsAdmin(exe) {
        this.exec_asadmin(exe)
    }

    waitPublicConfig(callback) {
        if (!Object.keys(config).length > 0) {
            setTimeout(() => {
                this.waitPublicConfig(callback)
            }, 500)
        } else {
            if (callback) callback()
        }
    }


    getUserDir(dir) {
        let homedir = os.homedir()
        if (dir) {
            homedir = path.join(homedir, dir)
        }
        fileUnit.mkbasedir(homedir)
        return homedir
    }

    getPrivateUserDir(dir) {
        let private_dir = this.getUserDir('.desktop_icons')
        if (dir) {
            private_dir = path.join(private_dir, dir)
        }
        fileUnit.mkbasedir(private_dir)
        return private_dir
    }

    getPath(name, dir) {
        //getPath(name: 'home' | 'appData' | 'userData' | 'sessionData' | 'temp' | 'exe' | 'module' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'crashDumps'): string;
        let homedir = this.app.getPath(name);
        if (dir) {
            homedir = path.join(homedir, dir)
            if (!fileUnit.isDir(homedir)) fileUnit.mkdir(homedir)
        }
        return homedir
    }

    getDesktopDir(dir) {
        return this.getPath('desktop', dir);
    }

    getUserDataDir(dir) {
        return this.getPath('userData', dir);
    }

    getAppDataDir(dir) {
        return this.getPath('appData', dir);
    }

    getDownloadsDir(dir) {
        return this.getPath('downloads', dir);
    }

    getDocumentsDir(dir) {
        return this.getPath('documents', dir);
    }

    getTempDir(dir) {
        return this.getPath('temp', dir);
    }

    async getPathEnv() {
        let listResult = await this.queryRegistry(this.pathKey)
        return listResult.values.Path.value
    }

    async setPathEnv(envs, callback) {
        if (typeof envs == 'string') {
            envs = [envs]
        }
        envs = envs.map(p => { return path.normalize(p).replace(/^[\/\\]+|[\/\\]+$/g, ''); })
        let pathEnv = await this.getPathEnv()

        let currentPath = pathEnv.split(';')
        currentPath = currentPath.map(p => {
            return path.normalize(p).replace(/^[\/\\]+|[\/\\]+$/g, '');
        })
        currentPath = currentPath.filter(val => { return val != '.' && val })

        let new_env = []
        let oriLen = currentPath.length
        for (let i = 0; i < envs.length; i++) {
            if (!currentPath.includes(envs[i])) {
                new_env.push(envs[i]);
            }
        }

        if (new_env.length == 0) {
            //没有新的变量，直接结束，无需设置
            messageWidget.log(`没有新的变量，直接结束，无需设置`)
            return
        }

        // let indexToSplit = utilUnit.array_lastchat(currentPath, "c:") + 1
        // let firstPart = currentPath.slice(0, indexToSplit);
        // let secondPart = currentPath.slice(indexToSplit);

        let default_version = []

        let default_python = stringUnit.getDefault(config.default_python, '3.10');
        let default_java = stringUnit.getDefault(config.default_java, '9');
        let default_node = stringUnit.getDefault(config.default_node, '18');

        default_python = default_python.replace(/\./g, '')
        default_java = default_java.replace(/\./g, '')
        default_node = default_node.replace(/\./g, '')

        default_version.push(`python` + default_python)
        default_version.push(`java` + default_java)
        default_version.push(`node-v` + default_node)
        default_version.push(`node` + default_node)

        new_env = utilUnit.array_priority(new_env, default_version)

        currentPath = [...currentPath, ...new_env];
        console.log(`set evn : ${currentPath}`)

        if (oriLen != currentPath.length) {
            let pathString = currentPath.join(';')
            let regValue = {
                Path: {
                    'type': 'REG_SZ',
                    'value': pathString,
                }
            }
            this.setRegistry(this.pathKey, regValue, (listResult) => {
                if (callback) callback(listResult)
            })
        }
    }

    getDefaultEnvVersion() {
        let default_version = []

        let default_python = stringUnit.getDefault(config.default_python, '3.10');
        let default_java = stringUnit.getDefault(config.default_java, '9');
        let default_node = stringUnit.getDefault(config.default_node, '18');
        let local_envdir = config.local_envdir

        default_python = default_python.replace(/\./g, '')
        default_java = default_java.replace(/\./g, '')
        default_node = default_node.replace(/\./g, '')

        default_version.push(`python` + default_python)
        default_version.push(`java` + default_java)
        default_version.push(`node-v` + default_node)
        default_version.push(`node` + default_node)

        let envs = fileUnit.scanDir(local_envdir)
        let evn = {}

        envs.forEach((env) => {
            env = path.basename(env)
            if (env != '.tmp') {
                let env_low = env.toLowerCase()
                let env_name = env_low.match(/^[a-zA-Z]*/)[0];
                if (!evn[env_name]) {
                    evn[env_name] = env
                }
                default_version.forEach(version => {
                    if (env_low.startsWith(version)) {
                        evn[env_name] = env
                    }
                })
            }
        })

        return evn
    }

    async queryRegistry(regKey) {
        const listResult = await regedit.list(regKey)
        if (listResult[regKey]) {
            return listResult[regKey]
        }
        return null
    }

    setRegistry(regKey, value, callback) {
        let regValue = {}
        regValue[regKey] = value
        regedit.putValue(regValue).then((listResult) => {
            if (callback) callback(listResult)
        }).catch(e => { })
    }

    getWindowsVersion() {
        const release = os.release();
        const majorVersion = parseInt(release.split('.')[0]);
        return majorVersion
    }

    processesCount(processe_name) {
        let cmd;
        const normalizedProcessName = processe_name.toLowerCase();
        if (os.platform() === 'win32') {
            cmd = 'tasklist';
        } else {
            cmd = 'ps aux';
        }
        try {
            const stdout = execSync(cmd, { encoding: 'utf8' });
            const count = stdout.split('\n').filter(line => line.toLowerCase().includes(normalizedProcessName)).length;
            return count;
        } catch (err) {
            console.error('Error executing command:', err);
            return 10000;
        }
    }

    isProcessesRun(processe_name) {
        let count = this.isProcessesRun(processe_name)
        if (count > 0 && count != 10000) {
            return true
        } else {
            return false
        }
    }

    getUnusedDrives() {
        try {
            const stdout = execSync('wmic logicaldisk get name').toString();
            const usedDrives = stdout.match(/[A-Z]:/g) || [];
            const allDrives = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `${letter}:`);
            const unusedDrives = allDrives.filter(drive => !usedDrives.includes(drive));
            return unusedDrives;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    saveUserData(key, val) {
        let data_dir = this.getPrivateUserDir(this.userDataFile)
        let data = fileUnit.readJSON(data_dir)
        data[key] = val;
        fileUnit.saveJSON(data_dir, data)
    }

    setUserData(key, val) {
        this.saveUserData(key, val)
    }

    getUserData(key) {
        let data_dir = this.getPrivateUserDir(this.userDataFile)
        let data = fileUnit.readJSON(data_dir)
        if (key) return data[key]
        return data;
    }

    hasUserData(key) {
        return key in this.getUserData()
    }

    hasAndSetUserData(key, val) {
        let has = this.hasUserData(key)
        if (val === undefined) {
            val = true
        }
        this.saveUserData(key, val)
        return has
    }

    hasAndAddListUserData(key, val) {
        let arr = this.getUserData(key)
        if (!arr) {
            arr = []
        }
        let has = false
        if (val != undefined) {
            has = arr.includes(val)
            if (!has) {
                arr.push(val)
            }
        }
        this.saveUserData(key, arr)
        return has
    }

    hasListUserData(key, val) {
        let arr = this.getUserData(key)
        if (!arr || !val) {
            return false
        }
        return arr.includes(val)
    }

    addListUserData(key, val) {
        let arr = this.getUserData(key)
        if (!arr) {
            arr = []
        }
        if (val != undefined) {
            if (!arr.includes(val)) {
                arr.push(val)
                this.saveUserData(key, arr)
            }
        }
    }

    exec_explorer(file_path, group, default_config, callback) {
        file_path = path.normalize(file_path)
        if (!fs.existsSync(file_path)) {
            if (group && default_config) file_path = path.join(default_config.icon_dir, group)
        }
        let cmd = `explorer "${file_path}"`
        console.log(cmd)
        utilUnit.exeBySpawn(cmd, (err, std) => {
            if (callback) callback(err, std)
        });
    }

    exec_asadmin(file_path, group, default_config, pare = '', callback) {
        file_path = path.normalize(file_path)
        let cmd
        let runmode = `explorer`
        if (!fs.existsSync(file_path)) {
            if (group && default_config) file_path = path.join(default_config.icon_dir, group)
            cmd = `explorer "${file_path}"`
        } else {
            if (fileUnit.isExecutable(file_path)) {
                let gsudo = fileUnit.get_bin(`gsudo.exe`)
                gsudo = path.normalize(gsudo)
                let current_user = os.userInfo().username;
                if (pare) {
                    pare = ` ` + pare
                }
                cmd = `${gsudo} -u ${current_user} "${file_path}"${pare}`
                runmode = `admin`
            } else {
                cmd = `explorer "${file_path}"${pare}`
            }
        }
        console.log(cmd)
        utilUnit.exeBySpawn(cmd, (err, std) => {
            let rData = {
                runmode,
                err,
                std
            }
            if (callback) callback(rData)
        });
    }

    getLanguageVersion(language, callback) {
        let command = '';
        switch (language.toLowerCase()) {
            case 'python':
                command = 'python --version';
                break;
            case 'java':
                command = 'java -version';
                break;
            case 'node':
                command = 'node -v';
                break;
            case 'rust':
                command = 'rustc --version';
                break;
            case 'go':
                command = 'go version';
                break;
            case 'ruby':
                command = 'ruby -v';
                break;
            case 'groovy':
                command = 'groovy --version';
                break;
            default:
                callback(null);
                return;
        }
        exec(command, (error, stdout, stderr) => {
            if (error) {
                callback(null);
                return;
            }

            const output = stdout || stderr;
            callback(output.trim());
        });
    }


    isHyperVEnabled(callback) {
        utilUnit.exec_cmd('dism /online /get-featureinfo /featurename:Microsoft-Hyper-V', (stdout, error, stderr) => {
            const isEnabled = stdout.includes('State : Enabled');
            callback(isEnabled);
        })
    }

    // 启用Hyper-V
    enableHyperV(callback) {
        exec('dism /online /enable-feature /featurename:Microsoft-Hyper-V /all', (error, stdout, stderr) => {
            if (error) {
                callback(null, error,);
                return;
            }
            const wasSuccessful = stdout.includes('successfully');
            callback(wasSuccessful, null);
        });
    }

    installOrUpdateWSL2(callback) {
        this.isWSL2Enabled((isWSL2, error) => {
            if (error) {
                callback(error);
                return;
            }

            if (isWSL2) {
                console.log("WSL2 is already enabled. Trying to upgrade any WSL1 distributions.");
                this.upgradeWSL1Distributions(callback);
            } else {
                console.log("WSL2 is not enabled. Starting installation process.");
                // TODO: Add the installation steps here.
                // For example, using exec to run installation commands.
            }
        });
    }

    checkVersionByTail(inputText, version) {
        const lines = inputText.split(/[\n\r]+/);
        console.log(lines)
        for (let line of lines) {
            line = line.replaceAll(/\s+$/g, ``)
            if (line.endsWith(version)) {
                return true;
            }
        }
        return false;
    }

    getWslDistributes(callback) {
        let cmd = 'wsl -l --quiet'
        utilUnit.exec_cmd(cmd, (stdout, error) => {
            stdout = stringUnit.trim(stdout)
            let distros = stdout.split(/\s+/)
            distros = distros.map(str => str.replace(/\x00/g, "")).filter(str => str != "");
            callback(distros);
        })
    }

    isWSL2Enabled(callback) {
        utilUnit.exec_cmd('wsl --status', (stdout, error) => {
            const hasWSL2 = this.checkVersionByTail(stdout, `2`)
            callback(hasWSL2, error);
        })
    }

    upgradeWSL1Distributions(callback) {
        exec('wsl --list --verbose', (error, stdout) => {
            if (error) {
                callback(error);
                return;
            }

            const wsl1Distributions = stdout.split('\n')
                .filter(line => line.includes(' 1 '))
                .map(line => line.trim().split(' ')[0]);

            if (wsl1Distributions.length === 0) {
                console.log("No WSL1 distributions found.");
                callback(null);
                return;
            }

            wsl1Distributions.forEach(dist => {
                console.log(`Upgrading ${dist} to WSL2.`);
                exec(`wsl --set-default-version  2`, (err) => {
                    if (err) {
                        callback(err);
                    } else {
                        console.log(`${dist} has been upgraded to WSL2.`);
                        callback(null);
                    }
                });
            });
        });
    }

    async isVisualStudio(callback) {
        let vs
        try {
            vs = await this.queryRegistry("HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\VisualStudio\\SxS\\VS7")
        } catch (e) {
            vs = null
        }
        if (callback) callback(vs)
    }
}

module.exports = new WindowsAPI()

