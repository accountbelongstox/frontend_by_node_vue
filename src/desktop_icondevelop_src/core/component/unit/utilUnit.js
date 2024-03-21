// const fs = require('fs');
// const os = require('os');
const {
    exec,
    execSync,
    spawn
    // execFile
} = require('node:child_process');
class UtilFunc {
    jscodes = []

    commandToString(obj, indent = 2) {
        if (typeof obj == 'string' || typeof obj == 'number') {
            obj = "" + obj
            obj = obj.replace(/\\/g, '/');
            obj = obj.replace(/`/g, '"');
            obj = obj.replace(/\x00/g, '')
            return obj;
        } else {
            if (obj === null) {
                return `null`;
            }
            else if (obj === false) {
                return `false`;
            }
            else if (obj === true) {
                return `true`;
            } else if (Array.isArray(obj)) {
                const formattedArray = obj.map(item => this.toString(item, indent));
                return `[${formattedArray.join(', ')}]`;
            } else {
                try {
                    let str = JSON.stringify(obj);
                    return str;
                } catch (error) {
                    let str = obj.toString()
                    return str;
                }
            }
        }
    }

    execSync(cmd) {
        const opt = execSync(cmd)
        return opt
    }

    exeBySpawn(command, message, callback) {
        if (!callback && message) {
            callback = message
            message = null
        }
        // 将命令字符串拆分为基础命令和参数
        const parts = command.split(/\s+/g);
        const cmd = parts[0];
        const args = parts.slice(1);

        const child = spawn(cmd, args, {
            shell: true
        });

        let stdoutData = '';
        let stderrData = '';
        let done = false

        child.stdout.on('data', (data) => {
            stdoutData += data.toString();
            if (message) {
                if (message) message(stdoutData)
            } else {
                callback(done, null, stdoutData);
            }
        });

        child.stderr.on('data', (data) => {
            stderrData += data.toString();
            if (message) {
                if (message) message(stderrData)
            } else {
                callback(done, null, stderrData);
            }
        });

        child.on('close', (code) => {
            done = true
            if (code !== 0) {
                callback(done, false, stderrData || `Command exited with code ${code}`);
            } else {
                callback(done, true, stdoutData);
            }
        });
    }


    exec_cmd(cmd, callback, log) {
        console.log(`exec_cmd : ${cmd}`)
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                if (log) {
                    log(`error : ${cmd}`)
                    log(error.message)
                } else {
                    console.error(`Error executing command: ${error.message}`);
                }
            }
            if (stderr) {
                if (log) {
                    log(`stderr : ${cmd}`)
                    log(stderr)
                } else {
                    console.error(`STDERR: ${stderr}`);
                }
            }
            if (stdout) {
                if (log) {
                    log(stdout)
                } else {
                    console.error(`STDOUT: ${stdout}`);
                }
            }
            if (callback) {
                stdout = this.commandToString(stdout)
                callback(stdout, error, stderr);
            }
        });
    }

    exec_cmds(cmds, callback, log) {
        if (typeof cmds == 'string') {
            cmds = [cmds]
        }
        if (cmds.length > 0) {
            let cmd = cmds.shift();
            this.exec_cmd(cmd, () => {
                log("exec" + cmd)
                this.exec_cmds(cmds, callback, log)
            }, log);
        } else {
            if (callback) callback()
        }
    }

    array_priority(items, keywords) {
        items.sort((a, b) => {
            const aLowerCase = a.toLowerCase();
            const bLowerCase = b.toLowerCase();
            const aContainsKeyword = keywords.some(keyword => aLowerCase.includes(keyword.toLowerCase()));
            const bContainsKeyword = keywords.some(keyword => bLowerCase.includes(keyword.toLowerCase()));
            if (aContainsKeyword && !bContainsKeyword) {
                return -1;
            } else if (!aContainsKeyword && bContainsKeyword) {
                return 1;
            }
            return 0;
        });
        return items;
    }

    array_lastchat(items, prefix) {
        let lastIndex = -1;
        for (let i = 0; i < items.length; i++) {
            if (items[i].toUpperCase().startsWith(prefix.toUpperCase())) {
                lastIndex = i;
            }
        }
        return lastIndex
    }


    mergeJSON(jsonA, jsonB) {
        for (const key in jsonB) {
            if (typeof jsonB[key] === 'object' && jsonB[key] !== null && !Array.isArray(jsonB[key])) {
                if (jsonA.hasOwnProperty(key) && typeof jsonA[key] === 'object' && !Array.isArray(jsonA[key])) {
                    this.mergeJSON(jsonA[key], jsonB[key]);
                } else {
                    jsonA[key] = jsonB[key];
                }
            } else {
                if (!jsonA.hasOwnProperty(key)) {
                    jsonA[key] = jsonB[key];
                }
            }
        }
        return jsonA;
    }

    getRandomItem(array) {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }

    deepParse(item) {
        if (typeof item === 'object' && item !== null) {
            if (Array.isArray(item)) {
                item.forEach((i, index) => {
                    item[index] = this.deepParse(i)
                })
            } else {
                for (const key in item) {
                    try {
                        item[key] = JSON.parse(item[key]);
                    } catch (e) {
                        if (typeof item === 'object' && item !== null) {
                            item[key] = item.toString()
                        }
                    }
                }
            }
        }
        return item;
    }

    getParamNames(func) {
        const fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
        let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
        result = result === null ? [] : result;
        result = result.map(item => item.toLowerCase());
        return result;
    }


    arrangeAccordingToA(paramNames, callback, args) {
        const l = paramNames.length;
        const index = paramNames.indexOf('callback');
        if (index !== -1) {
            paramNames[index] = callback;
            const args_a = args.slice(0, index);
            const args_b = args.slice(index);
            for (let i = 0; i < l; i++) {
                if (i < index) {
                    paramNames[i] = args_a[i] !== undefined ? args_a[i] : null;
                } else if (i > index) {
                    paramNames[i] = args_b[i - index - 1] !== undefined ? args_b[i - index - 1] : null;
                }
            }
        } else {
            const maxLength = Math.max(l, args.length);
            for (let i = 0; i < maxLength; i++) {
                if (i < l) {
                    paramNames[i] = args[i] !== undefined ? args[i] : null;
                } else {
                    paramNames.push(args[i]);
                }
            }
        }
        return paramNames;
    }


    isPromise(func) {
        return func instanceof Promise
    }

    isAsyncFunction(func) {
        return func.constructor && func.constructor.name == 'AsyncFunction';
    }

    isCall(func) {
        let para = this.getParamNames(func)
        return this.isCallByParam(para)
    }

    isCallByParam(paramNames) {
        const callbackIndex = paramNames.findIndex((param) => param.toLowerCase() === 'callback');
        if (callbackIndex === -1) {
            return false;
        }
        return true
    }
}
module.exports = new UtilFunc()

