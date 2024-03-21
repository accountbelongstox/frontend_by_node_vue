import socket from '@/api/vue3/socket.js';


class Preload {

    constructor() {
    }

    async init(){
        socket.init();
    }

    isElectron(){
        return !!window.isElectron
    }

}

export default new Preload();
