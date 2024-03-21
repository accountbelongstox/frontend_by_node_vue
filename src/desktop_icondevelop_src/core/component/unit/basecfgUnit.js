const path = require('path')
const fs = require('fs');

class Main {
    default_config_cache = null
    default_config = {
        "#default_python": { value: 3.6, options: '' },
        "#default_java": { value: 9, options: '' },
        "#default_node": { value: 18, options: '' },
        "#default_open_soft_mode": { value: true, options: '' },
        "#soft_localpath": { value: `D:/applications`, options: '' },
        "#local_envdir": { value: `D:/lang_compiler`, options: '' },
        "#programing_dir": { value: `D:/programing`, options: '' },
        "#setting_soft_backup_switch": { value: false, options: '' },
        "#setting_soft_local_bakup_path": { value: ``, options: '' },
        "#backup_remoteurl": { value: `\\\\192.168.100.1\\router\\programing/root:password`, options: '' },
        "#setting_soft_remote_update_url": { value: `http://nas.static.local.12gm.com:900`, options: '' },
        "#remote_soft_icon_conf": { value: `icons_base_cache.json`, options: '' },
        "#soft_link_variable": {
            value: `%UserProfile%/AppData/Local/Google -> Google
C:/Program Files/Google -> Google
C:/Program Files (x86)/Google -> Google/x86
%UserProfile%/AppData/Local/AVAST Software -> AVAST Software
C:/Program Files (x86)/AVAST Software -> AVAST Software
%UserProfile%/AppData/Local/Discord -> Discord
%UserProfile%/AppData/Local/AVG -> AVG
C:/Program Files/BraveSoftware -> BraveSoftware
C:/Program Files (x86)/Microsoft Visual Studio -> Microsoft Visual Studio
%UserProfile%/AppData/Local/AVG -> AVG`, options: ''
        },
    }

    basecfg() {
        return this.default_config
    }


    getBaseConfig() {
        if (this.default_config_cache) return this.default_config_cache
        let system_config = {
            window_width: 0,
            window_height: 0,
            icon_width: 50,
            open_dev_tools: false,
            window_frame: false,
            set_application_menu: false,
            icon_dir: this.getTemp(`icons_dir`)
        }
        const config_file = this.getTemp(`app.default.config`)
        let default_config
        if (fs.existsSync(config_file)) {
            default_config = this.readFromTextFile(config_file)
        } else {
            default_config = {}
        }

        // const primaryDisplay = screen.getPrimaryDisplay();
        // const { width, height } = primaryDisplay.workAreaSize;

        // const user32 = new ffi.Library('user32', {
        //     'GetSystemMetrics': ['int', ['int']]
        //   });
        //   const SM_CXSCREEN = 0;
        //   const SM_CYSCREEN = 1;
        //   const width = user32.GetSystemMetrics(SM_CXSCREEN);
        //   const height = user32.GetSystemMetrics(SM_CYSCREEN);

        default_config = this.mergeJsonObjects(system_config, default_config)
        if (!path.isAbsolute(default_config.icon_dir)) {
            default_config.icon_dir = path.join(process.cwd(), default_config.icon_dir)
        }

        if (!fs.existsSync(default_config.icon_dir)) {
            fs.mkdirSync(default_config.icon_dir, { recursive: true });
            console.log(`Folder ${default_config.icon_dir} created successfully.`);
        }

        let save_default_config = JSON.parse(JSON.stringify(default_config));

        save_default_config.icon_dir = path.relative(process.cwd(), save_default_config.icon_dir);

        this.saveToTextFile(config_file, save_default_config)
        console.log(default_config)
        this.default_config_cache = default_config
        return this.default_config_cache
    }


    mergeJsonObjects(jsonA, jsonB) {
        Object.keys(jsonB).forEach((key) => {
            if (jsonA.hasOwnProperty(key) && typeof jsonA[key] === 'object' && typeof jsonB[key] === 'object') {
                jsonA[key] = mergeJsonObjects(jsonA[key], jsonB[key]);
            } else {
                jsonA[key] = jsonB[key];
            }
        });
        return jsonA;
    }

    readFromTextFile(filepath) {
        const data = fs.readFileSync(filepath, 'utf8');
        const lines = data.split('\n');

        const obj = {};
        for (let line of lines) {
            line = line.trim()
            if (!line) continue
            const [key, value] = line.split('=');
            obj[key] = this.convertString(value);
        }

        return obj;
    }

    convertString(str) {
        if (str === "true") {
            return true;
        } else if (str === "false") {
            return false;
        } else if (!isNaN(str)) {
            return Number(str);
        } else {
            return str;
        }
    }

    saveToTextFile(filepath, obj) {
        const data = Object.entries(obj)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        fs.writeFileSync(filepath, data);
    }

    getTemp(dir) {
        let temp = path.join(process.cwd(), `temp`)
        if (dir) temp = path.join(temp, dir)
        return temp
    }
}

module.exports = new Main()