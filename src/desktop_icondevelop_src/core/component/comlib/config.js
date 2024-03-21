let config = {}
let config_base = {}

class Main{
    setConfig(obj){
		for (let key in obj) {
			config[key] = obj[key];
		}
    }

    getConfig(key){
        if(key){
            return config[key]
        }
        return config
    }
    
    setConfigBase(obj){
		for (let key in obj) {
			config_base[key] = obj[key];
		}
    }

    getConfigBase(key){
        if(key){
            return config_base[key]
        }
        return config_base
    }

    setEncyclopediaByKey(key,val){
        if(key && val){
            encyclopedia[key] = val
        }
    }
}
let configHandle = new Main()
module.exports = {
    config,
    config_base,
    configHandle:new Main()
}