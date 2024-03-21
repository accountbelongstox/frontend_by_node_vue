const path = require('path');
const os = require('os');
const fs = require('fs');

const fileUnit = require('../unit/fileUnit.js');
const stringUnit = require('../unit/stringUnit.js');
const basecfgUnit = require('../unit/basecfgUnit.js');

const httpWidget = require('../widget/httpWidget.js');

class Main {
    configCache = {}
    raw_config = {}
    config = {}
    config_base = {}

    getPublicConfigToHTML() {
        if (!Object.keys(this.raw_config).length) {
            let raw_config = this.get_raw_config()
            this.configCache = raw_config
            this.cast_config(raw_config, false)
        }
    }

    async cast_config_one(raw_one) {
        let raw = this.setRaw(raw_one)
        await this.cast_config(raw, true)
    }

    async cast_config(raw_config, save = true) {
        let config = this.rawToConf(raw_config)
        this.setRaw(raw_config)
        this.setConf(config)
        if (save) {
            this.save_config(raw_config)
        }
    }

    get_config(name) {
        if (!Object.keys(this.config).length) {
            this.getPublicConfigToHTML()
        }
        if (name) {
            return this.config[name]
        } else {
            return this.config
        }
    }

    rawToConf(raw_config) {
        let config = {}
        for (let key in raw_config) {
            let values = raw_config[key]
            key = this.getCastConfigKey(key)
            if (typeof values == 'object' && values != null) {
                values = values.value
            }
            config[key] = values
        }
        return config
    }

    getCastConfigKey(str) {
        // 匹配 "#xxx" 格式
        if (str.startsWith('#')) {
            return str.slice(1);
        }
        // 匹配 [name='xxx'] 或 [name="xxx"] 格式
        else if (str.match(/^\[name=['"].+['"]\]$/)) {
            return 'name_' + str.match(/['"](.*?)['"]/)[1];
        }
        else if (str.match(/^(\.\w+\s*)+$/)) {
            return 'class' + str.split(/\s+/).join('_').replace(/\./g, '_');
        }
        else {
            return str;
        }
    }

    setRaw(raw_config) {
        for (let key in raw_config) {
            this.raw_config[key] = raw_config[key]
        }
        return this.raw_config
    }

    setConf(config) {
        this.config = config
    }

    updateConfig(newConf, upConf) {
        let isUpdate = false
        for (const key in newConf) {
            if (upConf.hasOwnProperty(key)) {
                for (const subKey in newConf[key]) {
                    if (upConf[key].hasOwnProperty(subKey)) {
                        let newValue = newConf[key][subKey]
                        let oldValue = upConf[key][subKey]
                        if (newValue !== oldValue) {
                            upConf[key][subKey] = newConf[key][subKey];
                            isUpdate = true
                        }
                    } else {
                        isUpdate = true
                        upConf[key][subKey] = newConf[key][subKey];
                    }
                }
            } else {
                isUpdate = true
                upConf[key] = newConf[key];
            }
        }
        return { upConf, isUpdate }
    }

    updateConfigAndSaveCache(newConf) {
        let result = this.updateConfig(newConf, this.configCache)
        let isUpdate = result.isUpdate
        let upConf = result.upConf
        if (isUpdate) {
            this.configCache = upConf
        }
        return { upConf, isUpdate }
    }

    save_config(raw) {
        let result = this.updateConfigAndSaveCache(raw)
        let isUpdate = result.isUpdate
        let upConf = result.upConf
        console.log(`isUpdate`)
        console.log(isUpdate)
        console.log(`upConf`)
        console.log(upConf)
        if (!isUpdate) return
        if(upConf['viewIndex']){
            delete upConf['viewIndex']
        }
        for (const key in upConf) {
            if (typeof upConf[key] !== 'object') {
                upConf[key] = {
                    value_type:`text`,
                    value:upConf[key]
                }
            }else{
                let value_type = `text`
                let value = upConf[key].value
                if (upConf[key].hasOwnProperty(`value_type`)) {
                    value_type = upConf[key][`value_type`]
                }
                if (value_type == 'password') {
                    upConf[key].value = this.encode(value)
                } else if (value_type == 'array') {
                } else if (value_type == 'boolean') {
                    upConf[key].value = stringUnit.to_boolean(value)
                }
            }
        }
        
        console.log(`save`)
        console.log(upConf)
        this.saveConfig(upConf)
    }


    encodeJSON(json) {
        for (let key in json) {
            if (typeof json[key] === 'object') {
                json[key] = this.encodeJSON(json[key]);
            } else if (key.startsWith('pwd')) {
                json[key] = this.encode(json[key]);
            }
        }
        return json;
    }

    decodeJSON(raw) {
        const result = {};
        for (const key in raw) {
            let value = raw[key];
            if (typeof value === 'object') {
                result[key] = this.decodeJSON(value);
            } else if (typeof value == 'string') {
                result[key] = this.decode(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }


    obfuscate(a, b = '$#@FDsewt#@42fsdwe') {
        if (typeof a != "string") {
            return a
        }
        let pre_str = 'obfuscate:'
        if (a.startsWith(pre_str)) {
            return a
        }
        let c = '';
        for (let i = 0; i < a.length; i++) {
            c += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i % b.length));
        }
        return pre_str + c;
    }

    decode(b, c = '$#@FDsewt#@42fsdwe') {
        let a = b
        b = c
        if (typeof a != "string") {
            return a
        }
        let pre_str = 'obfuscate:'
        if (!a.startsWith(pre_str)) {
            return a
        }
        a = a.substring(pre_str.length);
        c = '';
        for (let i = 0; i < a.length; i++) {
            c += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i % b.length));
        }
        return c;
    }

    async saveConfig(raw) {
        let file = this.get_configfile()
        raw = this.encodeJSON(raw)
        fileUnit.saveJSON(file, raw)
    }

    readConfig() {
        let file = this.get_configfile()
        let raw = fileUnit.readJSON(file)
        return this.decodeJSON(raw)
    }

    get_configfile() {
        return this.getPrivateUserDir(`setting.config.json`)
    }


    getUserDir(dir) {
        let homedir = os.homedir();
        if (dir) {
            homedir = path.join(homedir, dir);
        }
        if (!fs.existsSync(homedir)) {
            fs.mkdirSync(homedir, { recursive: true });
        }
        return homedir;
    }

    getPrivateUserDir(dir) {
        let private_dir = this.getUserDir('.desktop_icons');
        if (dir) {
            private_dir = path.join(private_dir, dir);
        }
        if (!fs.existsSync(private_dir)) {
            fs.mkdirSync(private_dir, { recursive: true });
        }
        return private_dir;
    }


    get_raw_config() {
        let create_config = basecfgUnit.basecfg()
        let defalut_config = this.readConfig()
        for (let default_key in create_config) {
            if (!defalut_config[default_key]) {
                defalut_config[default_key] = create_config[default_key]
            }
        }
        this.configCache = defalut_config
        return defalut_config
    }

    getConfBase() {
        if (!Object.keys(this.config_base).length) {
            this.config_base = basecfgUnit.getBaseConfig()
        }
        return this.config_base
    }

    getInitConfig() {
        let config = {
            config_base: this.getConfBase(),
            config: this.get_config(),
            raw_config: this.raw_config,
        }
        return config
    }
}

module.exports = new Main()