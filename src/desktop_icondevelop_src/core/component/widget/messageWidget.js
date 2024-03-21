const stringUnit = require('../unit/stringUnit.js');
const httpWidget = require('../widget/httpWidget.js');

class Main {

    processMessages(message, timeout, type = 'success') {
        if (!timeout) {
            timeout = 4000
        }
        timeout = timeout / 1000

        let data = {
            type,
            message,
            timeout
        }
        httpWidget.sendToWebSocket(`public.message`, data, null,true)
    }

    log(message, timeout = 1500) {
        message = stringUnit.toString(message)
        console.log(message)
        this.processMessages(message, timeout, "log")
    }

    success(message, timeout = 1500) {
        message = stringUnit.toString(message)
        console.log(message)
        this.processMessages(message, timeout, "success")
    }

    error(message, timeout = 1500) {
        message = stringUnit.toString(message)
        console.error(message)
        this.processMessages(message, timeout, "error")
    }

    confirm(message, timeout = 1500) {
        message = stringUnit.toString(message)
        console.log(`confirm`+message)
        this.processMessages(message, timeout, "confirm")
    }

    warn(message, timeout = 1500) {
        message = stringUnit.toString(message)
        console.error(message)
        this.processMessages(message, timeout, "warn")
    }

}

module.exports = new Main()