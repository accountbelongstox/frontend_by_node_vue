let encyclopedia = {}

class Main{
    setEncyclopedia(obj){
		for (let key in obj) {
			encyclopedia[key] = obj[key];
		}
    }

    getEncyclopedia(key){
        if(key){
            return encyclopedia[key]
        }
        return encyclopedia
    }
    
    setEncyclopediaByKey(key,val){
        if(key && val){
            encyclopedia[key] = val
        }
    }
}


module.exports = new Main()