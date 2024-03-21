import { ipcApiRoute, specialIpcRoute } from '@/api/vue3/api_desktop.js';
import { io } from 'socket.io-client';
import {httpPort,socketPort} from '@/api/vue3/ports.js';
import mittEvent from '@/api/vue3/mitt.js';
let isConnecting = false
let socketing = null
let socketingCount = 0
let debug = false

class Socket {
    queue = [];
    socket = null;
    isConnected = false;

    constructor() {
    }

    async init(){
        await this.connect();
    }

    getIpFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const ip = params.get('ip');
        return ip || '127.0.0.1';
    }

    async connect() {
        if (this.socket) {
            console.log(`socket already exists`);
            return
        }
        if (isConnecting) {
            socketingCount += 1
            if (socketingCount >= 100) {
                socketing = null
                isConnecting = false
            }
            this.showMessage(`socket重新连接中...`)
            console.log(`Connection is already in progress. Skipping ${socketingCount}...`);
            return;
        }
        socketingCount = 0
        isConnecting = true;
        console.log('connect...');
        if (!this.socket) {
            const invokeIp = this.getIpFromUrl();
            const servicAddress = `ws://${invokeIp}:${socketPort}`
            console.log(`Socket-servicAddress: ${servicAddress}`);
            socketing = io(servicAddress);
            socketing.on('cl', (data) => {
                if(debug)console.log(`data`,data)
                let method = data.method
                let params = data.params
                mittEvent.emit(method, params)
                // console.log(`socket emit `, method)
            });
            socketing.on('error', (error) => {
                isConnecting = false;
                console.error('Connection error:', error);
                this.isConnected = false;
            });
            socketing.on('connect', () => {
                this.removeMessage()
                this.showMessage(`socket 已连接.`,2)
                console.log('Connected socket');
                isConnecting = false;
                this.isConnected = true;
                this.socket = socketing;
            });
            socketing.on('disconnect', () => {
                console.log('Disconnected from socket.io server. Reconnecting...');
                isConnecting = false;
                this.socket = null;
                setTimeout(() => {
                    this.connect();
                }, 100);
            });
        }
    }

    async addToQueue(method, params = {}, callback) {
        await this.connect();
        this.sendData(method, params, callback);
    }

    async postBySocketQueue(method, params = {}, callback) {
        await this.connect();
        this.sendData(method, params, callback);
    }

    async getBySocketQueue(method, params = {}, callback) {
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
            params = {};
        }
        await this.connect();
        this.sendData(method, params, callback);
    }

    serialize(obj, maxDepth = 100, currentDepth = 0, seen = new Set(), exclude = {}) {
        if (currentDepth >= maxDepth) { return null; }
        if (obj === null || typeof obj !== 'object') { return obj; }
        if (seen.has(obj)) { return null; }
        seen.add(obj);
        let result = Array.isArray(obj) ? [] : {};
        const keys = Object.keys(obj)
        keys.forEach(key => {
            let value = obj[key];
            if (exclude[key] != undefined) {
                if (exclude[key].value != undefined) {
                    result[key] = exclude[key].value;
                }
                return;
            }
            if (typeof value === 'function') {
                result[key] = null;
                return;
            }
            result[key] = this.serialize(value, maxDepth, currentDepth + 1, seen, exclude);
        })
        seen.delete(obj);
        return result;
    }

    async sendData(method, params, callback, direct = false) {
        if(typeof params === 'function'){
            callback = params
            params = {}
        }
        if (this.socket) {
            if (!direct && method.indexOf(`.`) == -1) {
                method = ipcApiRoute[method];
            }
            params = this.serialize(params)
            params = JSON.stringify(params)
            params = JSON.parse(params)
            this.socket.emit('c1', { cmd: method, params: params }, (response) => {
                if (response) {
                    if(debug)console.log(response)
                } else {
                    console.log(`socket Not fetch response`, response)
                }
                if (callback) callback(response);
            });
        } else {
            await this.connect();
            setTimeout(async () => {
                await this.sendData(method, params, callback)
            }, 2000)
        }
    }

    showMessage(message,duration) {
        const id = `uTNiOBRncT`;
        let element = document.getElementById(id);
        if (!element) {
            element = document.createElement('div');
            element.id = id;
            element.style.position = 'fixed';
            element.style.top = '100px';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            element.style.width = '80%';
            element.style.height = '100px';
            element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; 
            element.style.zIndex = '9999'; 
            const span = document.createElement('span');
            span.textContent = message;
            span.style.color = 'white';
            span.style.fontSize = '16px';
            span.style.position = 'absolute';
            span.style.top = '50%';
            span.style.left = '50%';
            span.style.transform = 'translate(-50%, -50%)';
            element.appendChild(span);
            document.body.appendChild(element);
            if (duration && typeof duration === 'number') {
                setTimeout(() => {
                    element.remove();
                }, duration * 1000); 
            }
        }
    }

    removeMessage() {
        const id = `uTNiOBRncT`;
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }
}

export default new Socket();
