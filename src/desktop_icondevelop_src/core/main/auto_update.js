const path = require('path');

const {
  stringUnit,
  fileUnit,
  utilUnit,
  // frameUnit,
} = require('../component/comlib/unit.js');
const {
  httpWidget,
  messageWidget,
} = require('../component/comlib/widget.js');

const { config_base, config } = require('../component/comlib/config.js');
class SoftwareUpdater {
  soft_version_file = `soft_version.json`
  need_update = false
  checkInterval = 60000

  getRemoteUpdateUrl(url) {
    let remote_url = config.setting_soft_remote_update_url
    if (url) remote_url = httpWidget.joinURL(remote_url, url)
    return remote_url
  }

  async execUpdate(callback) {
    let version_url = this.getRemoteUpdateUrl(`deskmanager_update/${this.soft_version_file}`)
    let remote_version_json = await httpWidget.getJSON(version_url)
    let local_version_json = this.readLocalVersionJSON()
    let local_version = local_version_json.version
    let remote_version = remote_version_json.version
    let srcName = remote_version_json.src
    let node_modulesName = remote_version_json.node_modules
    let update_temp = fileUnit.getAppRoot(`.update`)
    try {
      if (this.compareVersions(local_version, remote_version) == 1) {
        this.downSorce(`src`, remote_version_json, update_temp, (success) => {
          if (success) {
            this.downSorce(`node_modules`, remote_version_json, update_temp, (success) => {
              if (success) {
                messageWidget.success(`升级成功, 请等待软件重启.`)
                fileUnit.deleteFolderAsync(update_temp)
                local_version_json.version = remote_version
                this.saveLocalVersionJSON(local_version_json)
                if (callback) callback(true)
              }
            })
          }
        })
      }
    } catch (e) {
      messageWidget.log(e)
      if (callback) callback(false)
    }
  }

  async downSorce(src, remote_version_json, update_temp, callback) {
    let src_dir = fileUnit.getAppRoot(src)
    messageWidget.log(`update src ${src_dir}`)
    if (!fileUnit.isLocked(src_dir)) {
      let update_zip = remote_version_json[src]
      let update_url = this.getRemoteUpdateUrl(`deskmanager_update/${update_zip}`)
      try {
        httpWidget.getFileAndUnzip(update_url, update_temp, (downloadfile, usetime) => {
          let src_temp_dir = path.join(update_temp, src)
          let src_backup_dir = fileUnit.getAppRoot(`${src}_${fileUnit.getSafeFilename(stringUnit.createTime())}`)
          let src_new_update_dir = fileUnit.getAppRoot(src)
          console.log(`usetime ${usetime}`)
          console.log(`downloadfile ${downloadfile}`)
          console.log(`${src}_temp_dir ${src_temp_dir}`)
          console.log(`${src}_new_update_dir ${src_new_update_dir}`)
          if (fileUnit.isDir(src_dir)) {
            if (!fileUnit.isLocked(src_dir)) {
              fileUnit.rename(src_dir, src_backup_dir)
              fileUnit.delete(downloadfile)
              setTimeout(() => {
                fileUnit.moveFolder(src_temp_dir, src_new_update_dir, (destinationPath, success, usetime, fail) => {
                  if (callback) callback(true)
                })
              }, 1000)
            } else {
              messageWidget.error(`升级失败, 根目录 src 文件被占用.`)
              if (callback) callback(false)
            }
          }
        }, true)
      } catch (e) {
        console.log(e)
        if (callback) callback(false)
      }
    } else {
      messageWidget.error(`升级失败, 根目录 src 文件被占用.`)
      if (callback) callback(false)
    }
  }

  async checkIntervalUpdate() {
    let version_url = this.getRemoteUpdateUrl(`deskmanager_update/${this.soft_version_file}`)
    let remote_version_json = await httpWidget.getJSON(version_url)
    let local_version_json = this.readLocalVersionJSON()
    let local_version = local_version_json.version
    let remote_version = remote_version_json.version
    if (this.compareVersions(local_version, remote_version) == 1) {
      this.notifyUpdate()
      setInterval(() => {
        this.notifyUpdate()
      }, 180000)
    }
  }

  notifyUpdate() {
    this.need_update = true
    let data = {
      selector: ".show-software_update"
    }
    httpWidget.sendToWebSocket(`public.show`, data, null, true)
    clearInterval(this.checkEvent)
  }

  async checkUpdateOnlyExec() {
    this.createDefaultVersion()
    if (!this.checkEvent) {
      setTimeout(() => {
        this.checkIntervalUpdate()
      }, 3000)
      this.checkEvent = setInterval(() => {
        this.checkIntervalUpdate()
      }, this.checkInterval)
    }
  }

  createDefaultVersion() {
    let softversion = {
      version: 1.0,
    }
    let soft_version_file = this.getLocalVersionFile()
    if (!fileUnit.isFile(soft_version_file)) {
      fileUnit.saveJSON(soft_version_file, softversion)
    } else {
      let local_version = this.readLocalVersionJSON()
      local_version = utilUnit.mergeJSON(local_version, softversion)
      fileUnit.saveJSON(soft_version_file, local_version)
    }
  }

  compareVersions(versionA, versionB) {
    if (!versionA) versionA = 0
    if (!versionB) versionB = 0
    const partsA = versionA.toString().split('.');
    const partsB = versionB.toString().split('.');
    const maxLength = Math.max(partsA.length, partsB.length);
    for (let i = 0; i < maxLength; i++) {
      const numA = parseInt(partsA[i] || 0, 10);
      const numB = parseInt(partsB[i] || 0, 10);
      if (numA > numB) return -1;
      else if (numA < numB) return 1;
    }
    return 0;
  }

  getLocalVersionFile() {
    return fileUnit.getRoot(this.soft_version_file)
  }

  readLocalVersionJSON() {
    let soft_version = this.getLocalVersionFile()
    return fileUnit.readJSON(soft_version)
  }

  saveLocalVersionJSON(vJson) {
    let soft_version = this.getLocalVersionFile()
    return fileUnit.saveJSON(soft_version, vJson)
  }

  extractZip(zipPath, destPath, callback) {
    extract(zipPath, { dir: path.resolve(destPath) }, callback);
  }

}


module.exports = new SoftwareUpdater()