const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const fileUnit = require('../unit/fileUnit.js');
const stringUnit = require('../unit/stringUnit.js');

const winapiWidget = require('../widget/winapiWidget.js');
const messageWidget = require('../widget/messageWidget.js');

class zipProcess {
  callbacks = {}
  maxTasks = 10;
  pendingTasks = [];
  concurrentTasks = 0;
  execCountTasks = 0
  execTaskEvent = null
  zipExecPath = path.join(__dirname, '../../static/bin/7z.exe');
  zipQueueTokens = []

  setMode(mode) {
    this.mode = mode
  }

  log(msg, event) {
    if (event) {
      messageWidget.success(msg)
    }
  }

  async compressDirectory(srcDir, outDir, token, callback) {
    const srcAbsPath = path.resolve(srcDir);
    const outAbsPath = path.resolve(outDir);
    if (!fs.existsSync(srcAbsPath)) {
      return;
    }
    if (!fs.existsSync(outAbsPath)) {
      fileUnit.mkdirSync(outAbsPath)
    }
    const subDirectories = fs.readdirSync(srcAbsPath, { withFileTypes: true }).filter(entry => entry.isDirectory());
    for (const subDir of subDirectories) {
      const subDirName = subDir.name;
      if (subDirName.startsWith(`.`)) {
        continue
      }
      const subDirPath = path.join(srcAbsPath, subDirName);
      this.putZipQueueTask(subDirPath, outDir, token, callback)
    }
  }

  getZipPath(srcDir, outDir) {
    const srcDirName = path.basename(srcDir);
    const zipFileName = `${srcDirName}.zip`;
    const zipFilePath = path.join(outDir, zipFileName);
    return zipFilePath
  }

  async addToPendingTasks(command, callback) {
    this.concurrentTasks++;
    let startTime = new Date();
    exec(command, (error, stdout, stderr) => {
      if (error) {
        this.log(`Error compressing: ${error.message}`);
      } else if (stdout) {
        this.log(`StdError compressing: ${stderr.toString()}`);
      }
      if (callback) callback(new Date() - startTime)
    });
  }

  async execTask() {
    if (!this.execTaskEvent) {
      this.log(`Background compaction task started`, true);
      this.execTaskEvent = setInterval(() => {
        let processZipCount = winapiWidget.processesCount(`7z.exe`)
        if (processZipCount != 10000) {
          this.concurrentTasks = processZipCount
        }
        if (this.concurrentTasks >= this.maxTasks) {
          this.log(`7zProcesse tasks is full. current tasks:${this.concurrentTasks}, waiting...`);
        } else if (this.pendingTasks.length > 0) {

          const TaskObject = this.pendingTasks.shift(); // 获取待执行的任务
          const command = TaskObject.command
          const isQueue = TaskObject.isQueue
          const token = TaskObject.token

          let zipPath = TaskObject.zipPath
          let zipName = path.basename(zipPath)
          if (!fileUnit.isFileLocked(zipPath)) {
            this.log(`Unziping ${zipName}, background:${this.concurrentTasks}`, true);
            this.execCountTasks++
            this.addToPendingTasks(command, (usetime) => {
              this.log(`${zipName} Compressed.runtime: ${usetime / 1000}s`, true);
              this.deleteTask(zipPath)
              this.callbacks[token].usetime += usetime
              this.execCountTasks--;
              this.concurrentTasks--; // 任务完成后减少并发任务计数
              if (!isQueue) {
                this.execTaskCallback(token)
              }
            })
          } else {
            this.pendingTasks.push(TaskObject);
            this.log(`The file is in use, try again later, "${zipPath}"`)
          }
        } else {
          if (this.execCountTasks < 1) {
            clearInterval(this.execTaskEvent)
            this.execTaskEvent = null
            this.log(`There is currently no compression task, end monitoring.`);
            this.execTaskQueueCallbak()
          } else {
            this.log(`There are still ${this.execCountTasks} compression tasks, waiting`)
          }
        }
      }, 1000)
    }
  }

  execTaskQueueCallbak() {
    this.zipQueueTokens.forEach(token => {
      this.execTaskCallback(token)
    })
  }

  execTaskCallback(token) {
    if (this.callbacks[token]) {
      let callback = this.callbacks[token].callback
      let usetime = this.callbacks[token].usetime
      let src = this.callbacks[token].src
      delete this.callbacks[token]
      if (callback) callback(usetime, src)
    }
  }

  putZipTask(src, out, token, callback) {
    this.putTask(src, out, token, true, callback, false)
  }

  putZipQueueTask(src, out, token, callback) {
    this.putTask(src, out, token, true, callback)
  }

  putUnZipTask(src, out, callback) {
    let token = stringUnit.get_id(src)
    this.putTask(src, out, token, false, callback, false)
  }
  putUnZipQueueTask(src, out, callback) {
    let token = stringUnit.get_id(src)
    this.putTask(src, out, token, false, callback)
  }

  putQueueCallback(callback, token) {
    if (callback && !this.callbacks[token]) {
      if (!token) token = stringUnit.create_id()
      this.zipQueueTokens.push(token)
      this.callbacks[token] = {
        callback,
        usetime: 0,
        src:``
      }
    }
  }

  putTask(src, out, token, isZip = true, callback, isQueue = true) {
    if (callback && !this.callbacks[token]) {
      this.callbacks[token] = {
        callback,
        usetime: 0,
        src
      }
    }
    if (isQueue) {
      this.zipQueueTokens.push(token)
    }
    let zipPath
    let command
    if (isZip) {
      zipPath = this.getZipPath(src, out)
      if (fileUnit.existsSync(zipPath)) {
        if (!this.mode) {
          return
        }
        if (this.mode.update) {
          let srcModiTime = fileUnit.getModificationTime(src)
          let zipPathModiTime = fileUnit.getModificationTime(zipPath)
          let difTime = srcModiTime - zipPathModiTime
          if (difTime < 1000 * 60) {
            return
          }
          fileUnit.delete(zipPath)
        } else if (this.mode.override) {
          fileUnit.delete(zipPath)
        } else {
          return
        }
      }
      let zipSize = fileUnit.getFileSize(zipPath)
      if (zipSize == 0) {
        fileUnit.delete(zipSize)
      }
      command = this.createZipCommand(src, out)
    } else {
      zipPath = src
      command = this.createUnzipCommand(src, out)
    }

    if (!this.isTask(zipPath)) {
      let zipAct = isZip ? `compression` : `unzip`
      let zipName = path.basename(zipPath)
      this.log(`Add a ${zipAct} ${zipName}, background:${this.concurrentTasks}`, true);
      this.pendingTasks.push({
        command,
        zipPath,
        token,
        isQueue
      })
    }
    this.execTask()
  }

  deleteTask(zipPath) {
    const index = this.pendingTasks.findIndex(item => item.zipPath === zipPath);
    if (index > -1) {
      this.pendingTasks.splice(index, 1);
    }
  }

  isTask(zipPath) {
    return this.pendingTasks.some(item => item.zipPath === zipPath);
  }

  createZipCommand(srcDir, outDir) {
    const srcDirName = path.basename(srcDir);
    const zipFileName = `${srcDirName}.zip`;
    const zipFilePath = path.join(outDir, zipFileName);
    const command = `"${this.zipExecPath}" a "${zipFilePath}" "${srcDir}"`;
    return command
  }

  createUnzipCommand(zipFilePath, destinationPath) {
    const command = `${this.zipExecPath} x "${zipFilePath}" -o"${destinationPath}" -y`;
    return command;
  }

  test(archivePath) {
    try {
      execSync(`${this.zipExecPath} t "${archivePath}"`, { stdio: 'pipe' });
      // 如果命令执行成功，说明压缩文件完好无损
      return true;
    } catch (error) {
      console.error("Error testing the archive:", error);
      return false;
    }
  }
}

module.exports = new zipProcess()
