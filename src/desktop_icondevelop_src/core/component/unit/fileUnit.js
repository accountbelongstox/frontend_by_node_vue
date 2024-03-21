const fs = require('fs');
const path = require('path');
const util = require('util');
const os = require('os');
const crypto = require('crypto');
// const glob = require('glob');
const { execSync, exec } = require('child_process');
const fsPromises = require('fs').promises;
const fsStatPromises = util.promisify(fs.stat);
const accessPromises = util.promisify(fs.access);

class fileUnit {
    userDataFile = 'userData.json';
    callbacks = {}
    pendingTasks = []
    maxTasks = 1
    execCountTasks = 0
    copyDirectoryCallbak = {}

    getUserDir(dir) {
        let homedir = os.homedir()
        if (dir) {
            homedir = path.join(homedir, dir)
        }
        this.mkbasedir(homedir)
        return homedir
    }

    getPrivateUserDir(dir) {
        let private_dir = this.getUserDir('.desktop_icons')
        if (dir) {
            private_dir = path.join(private_dir, dir)
        }
        this.mkbasedir(private_dir)
        return private_dir
    }


    saveUserData(key, val) {
        let data_dir = this.getPrivateUserDir(this.userDataFile)
        let data = this.readJSON(data_dir)
        data[key] = val;
        this.saveJSON(data_dir, data)
    }

    getUserData(key) {
        let data_dir = this.getPrivateUserDir(this.userDataFile)
        let data = this.readJSON(data_dir)
        if (key) return data[key]
        return data;
    }

    hasUserData(key) {
        return key in this.getUserData()
    }

    findInParentDirectories(filename, currentDir) {
        if (!currentDir) {
            currentDir = process.cwd();
        }
        let filePath = path.join(currentDir, filename);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
        while (currentDir !== path.parse(currentDir).root) {
            let filePath = path.join(currentDir, filename);
            if (fs.existsSync(filePath)) {
                return filePath;
            }
            currentDir = path.dirname(currentDir);
        }
        return null;
    }

    get_path(filename, mkdir = true) {
        if (!path.isAbsolute(filename)) {
            filename = path.join(process.cwd(), filename);
        }
        let basedir = path.dirname(filename)
        if (mkdir) this.mkdir(basedir)
        return filename
    }

    getTempPath(dir) {
        return this.get_path(`temp/${dir}`)
    }

    existsSync(filename) {
        return fs.existsSync(filename)
    }

    symlink(src, target, force = false) {
        if (force) {
            // if (fs.existsSync(src)) {
            //     const stats = fs.lstatSync(src);
            //     if (stats.isDirectory()) {
            //         this.deleteFolder(src);
            //     } else if (stats.isSymbolicLink()) {
            //         fs.unlinkSync(src);
            //     }
            // }
            if (fs.existsSync(target)) {
                const stats = fs.lstatSync(target);
                if (stats.isDirectory()) {
                    this.deleteFolder(target);
                } else if (stats.isSymbolicLink()) {
                    fs.unlinkSync(target);
                }
            }
        }
        if (!this.existsSync(src)) {
            this.mkdir(src)
        }
        if (!this.existsSync(target)) {
            fs.symlinkSync(src, target, 'junction');
        }
    }


    readBase64ByFile(filePath) {
        const extname = path.extname(filePath).toLowerCase();
        let mimeType;
        switch (extname) {
            case '.ico':
                mimeType = 'image/x-icon';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
            case '.bmp':
                mimeType = 'image/bmp';
                break;
            case '.gif':
                mimeType = 'image/gif';
                break;
            default:
                return null
        }
        const imageData = fs.readFileSync(filePath);
        const base64Image = Buffer.from(imageData).toString('base64');
        return `data:${mimeType};base64,${base64Image}`;
    }

    symlinkSync(src, target) {
        this.symlink(src, target)
    }

    slicePathLevels(filePath, levels) {
        const parts = path.normalize(filePath).split(path.sep);
        const truncatedParts = parts.slice(0, levels + 1);
        return truncatedParts.join(path.sep);
    }

    replaceDir(src, new_pre, level) {
        src = this.slicePathLevels(src, level)
        src = path.join(new_pre, src)
        return src
    }

    getDrive(pf) {
        const match = /^[a-zA-Z]+/.exec(pf);
        if (match) {
            return match[0].toLowerCase();
        }
        return null;
    }

    isDrive(pf, drive) {
        const pf_drive = this.getDrive(pf)
        if (pf_drive == drive) {
            return true
        }
        return false;
    }

    isFile(filename) {
        if (!filename || typeof filename != "string") {
            return false
        }
        filename = this.get_path(filename, false);
        if (this.existsSync(filename)) {
            const stats = fs.statSync(filename);
            if (stats.isFile()) {
                return true
            }
        }
        return false
    }

    isFileAsync(filename, callback) {
        if (!filename || typeof filename !== "string") {
            callback(false);
            return;
        }
        filename = this.get_path(filename, false);
        fs.exists(filename, exists => {
            if (exists) {
                fs.stat(filename, (err, stats) => {
                    if (err) {
                        callback(false);
                    } else if (stats.isFile()) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                });
            } else {
                callback(false);
            }
        });
    }


    isDir(filename) {
        return this.isDirectory(filename)
    }

    isDirectory(filename) {
        filename = this.get_path(filename, false);
        if (this.existsSync(filename)) {
            const stats = fs.statSync(filename);
            if (stats.isDirectory()) {
                return true
            }
        }
        return false
    }

    deleteSync(filename) {
        if (this.existsSync(filename)) {
            if (fs.lstatSync(filename).isDirectory()) {
                this.deleteFolder(filename)
            } else {
                this.deleteFile(filename)
            }
        }
    }

    deleteFile(filePath) {
        fs.unlinkSync(filePath);
    }

    deleteFolder(folderPath) {
        if (fs.existsSync(folderPath)) {
            if (fs.lstatSync(folderPath).isDirectory() && !folderPath.endsWith('.asar')) {
                fs.rmSync(folderPath, {
                    force: true,
                    recursive: true,
                    maxRetries: 50,
                    retryDelay: 1000,
                })
            } else {
                fs.unlinkSync(folderPath);
            }
        }
    }

    async deleteFolderAsync(folderPath, callback, retry = 50, retryStep = 0) {
        fs.lstat(folderPath, (err, stats) => {
            if (this.isLocked(folderPath) || err) {
                if (err) console.log(err)
                if (retryStep >= retry) {
                    if (callback) callback(false)
                }
                setTimeout(() => {
                    retryStep++
                    this.deleteFolderAsync(folderPath, callback, retry, retryStep)
                }, 500)
            }
            if (stats.isDirectory() && !folderPath.endsWith('.asar')) {
                fs.rmdir(folderPath, {
                    recursive: true
                }, () => {
                    if (callback) callback(true)
                });
            } else {
                fs.unlink(folderPath, () => {
                    if (callback) callback(true)
                });
            }
        })
    }

    async fsExists(fPath) {
        try {
            await fs.access(fPath);
            return true;
        } catch {
            return false;
        }
    }

    delete(filename) {
        return this.deleteSync(filename)
    }

    readFile(filePath) {
        try {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            return rawData;
        } catch (err) {
            console.error(`Failed to read JSON file: ${err}`);
            return null;
        }
    }

    getFileSize(filePath) {
        if (!this.existsSync(filePath)) {
            return -1
        }
        try {
            const stats = fs.statSync(filePath);
            const fileSizeInBytes = stats.size;
            return fileSizeInBytes;
        } catch (error) {
            return -1; // 返回-1表示获取文件大小失败
        }
    }

    getDirectorySize(directoryPath) {
        let totalSize = 0;
        const files = fs.readdirSync(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                totalSize += stats.size;
            } else if (stats.isDirectory()) {
                totalSize += this.getDirectorySize(filePath);
            }
        }
        return totalSize;
    }

    getModificationTime(fp) {
        if (!this.existsSync(fp)) {
            return 0
        }
        try {
            const stats = fs.statSync(fp);
            return stats.mtime.getTime(); // 返回修改时间
        } catch (error) {
            console.error(`Error getting modification time: ${error.message}`);
            return 0;
        }
    }

    saveFile(file_path, text) {
        if (!path.isAbsolute(file_path)) {
            file_path = path.join(this.get_root(), file_path)
        }
        if (fs.existsSync(file_path)) {
            // 如果文件已经存在则覆盖写入
            fs.writeFileSync(file_path, text, 'utf-8');
        } else {
            // 如果文件不存在则创建写入
            fs.writeFileSync(file_path, text, { flag: 'wx', encoding: 'utf-8' });
        }
        return file_path
    }

    readDir(directoryPath) {
        const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
        // const subdirectories = entries
        //     .filter(entry => entry.isDirectory())
        //     .map(dir => path.join(directoryPath, dir.name));

        return entries;
    }

    searchFile(dir, filename) {
        return this.findFile(dir, filename)
    }

    findFile(dir, targetFile) {
        if (!fs.statSync(dir).isDirectory()) {
            return null
        }

        const files = fs.readdirSync(dir);
        for (let file of files) {
            let fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                // 如果是目录，递归搜索
                let result = this.findFile(fullPath, targetFile);
                if (result) return result; // 如果在子目录中找到，则返回结果
            } else if (file.toLowerCase() === targetFile.toLowerCase()) {
                // 如果找到文件，返回文件的绝对路径
                return fullPath;
            }
        }

        return null; // 如果没有在当前目录或其子目录中找到，返回null
    }

    scanDir(directoryPath) {
        const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
        const subdirectories = entries
            .filter(entry => entry.isDirectory())
            .map(dir => path.join(directoryPath, dir.name));

        return subdirectories;
    }

    readJSON(file_name) {
        if (!this.isFile(file_name)) {
            return {}
        }
        let content = this.readFile(file_name);
        if (content) {
            try {
                content = JSON.parse(content)
                if (typeof content == 'string') {
                    content = JSON.parse(content)
                }
            } catch (err) {
                content = {}
                console.log(err)
            }
        } else {
            content = {}
        }
        return content
    }

    saveJSON(file_name, json_text) {
        if (typeof json_text != 'string') {
            json_text = JSON.stringify(json_text, {}, 2);
        }
        let dirname = path.dirname(file_name)
        console.log(`file_name ${file_name}`)
        console.log(`dirname ${dirname}`)
        this.mkdir(dirname)
        fs.writeFileSync(file_name, json_text, 'utf-8');
    }

    mkdirSync(directoryPath) {
        return this.mkdir(directoryPath)
    }

    async mkdir(directoryPath) {
        if (!fs.existsSync(directoryPath) && !fs.statSync(filename).isDirectory()) {
            let isSymbolicLink = this.isSymbolicLink(directoryPath)
            if (isSymbolicLink) return directoryPath
            fs.mkdirSync(directoryPath, { recursive: true });
        }
        return directoryPath
    }

    async mkdirPromise(dirPath) {
        try {
            await accessPromises(dirPath, fs.constants.F_OK);
            const stats = await fsStatPromises(dirPath);
            if (stats.isFile()) {
                await fsPromises.mkdir(dirPath, { recursive: true });
            }
        } catch (e) {
            if (e.code === 'ENOENT') {
                await fsPromises.mkdir(dirPath, { recursive: true });
            } else {
                throw e;
            }
        }
    }

    isSymbolicLink(folderPath) {
        try {
            const stats = fs.lstatSync(folderPath);
            return stats.isSymbolicLink();
        } catch (error) {
            return false;
        }
    }
    mkbasedir(directoryPath) {
        directoryPath = path.dirname(directoryPath)
        return this.mkdir(directoryPath)
    }

    getRoot(filename) {
        return this.get_root(filename)
    }

    findDirectoryWithSubdirs(baseDir, subdirs) {
        const allDirs = fs.readdirSync(baseDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const dir of allDirs) {
            const fullPath = path.join(baseDir, dir);
            const childDirs = fs.readdirSync(fullPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            // 检查每个子文件夹是否都存在
            if (subdirs.every(subdir => childDirs.includes(subdir))) {
                return fullPath;
            }

            // 递归查找
            const deepSearchResult = this.findDirectoryWithSubdirs(fullPath, subdirs);
            if (deepSearchResult) {
                return deepSearchResult;
            }
        }

        return null;
    }


    getAppRoot(dir) {
        let dirs = ['node_modules', 'src'];
        let rootPath = this.getRoot()
        let result = this.findDirectoryWithSubdirs(rootPath, dirs);
        if (dir && result) {
            result = path.join(result, dir)
        }
        return result;
    }

    getTemp(filename) {
        let root = this.getRoot('temp')
        if (filename) {
            root = path.join(root, filename)
        }
        return root
    }

    get_root(filename) {
        let root = process.cwd();
        if (filename) {
            root = path.join(root, filename)
        }
        return root;
    }

    readDirectory(dirPath) {
        let directory = {};
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                file = file.trim()
                directory[file] = this.readDirectory(filePath);
            } else {
                if (!Array.isArray(directory)) {
                    directory = []
                }
                directory.push(file);
            }
        });
        // return JSON.stringify(directory, null, 2)
        return directory;
    }

    // 获取相对路径
    getRelativePath(sortPath, longPath) {
        const relativePath = path.relative(sortPath, longPath);
        const partsB = relativePath.split(path.sep);
        const partsA = sortPath.split(path.sep);

        // 删除路径 B 中包含路径 A 的部分
        while (partsB.length > 0 && partsA.length > 0 && partsB[0] === partsA[0]) {
            partsB.shift();
            partsA.shift();
        }
        const resultPath = partsB.join(path.sep);
        return resultPath;
    }

    // 获取相对路径
    getNormalPath(p) {
        return path.normalize(p);
    }

    // 将路径 p 添加到路径 a 的开头
    addPathPrefix(a, p) {
        const normalizedA = path.normalize(a);
        const normalizedP = path.normalize(p);
        if (normalizedP.startsWith(normalizedA)) {
            return normalizedP;
        }
        const joinedPath = path.join(normalizedA, normalizedP);
        const relativePath = path.relative(process.cwd(), joinedPath);
        if (!relativePath.startsWith('..')) {
            return relativePath;
        }
        return joinedPath;
    }

    saveToTextFile(filepath, obj) {
        const data = Object.entries(obj)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        fs.writeFileSync(filepath, data);
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


    mkdir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    isUpdateFile(source, target) {
        if (!this.isFile(target)) {
            return true
        }
        source = this.get_modifydate(source)
        target = this.get_modifydate(target)
        return source > target
    }

    get_modifydate(filename) {
        filename = this.get_path(filename, false)
        let stat = fs.statSync(filename)
        var mtime = stat.mtime;
        return mtime.getTime()
    }

    matchPath(filePath, pathList) {
        // filePath = path.normalize(filePath)
        // for (let p of pathList) {
        //     p = path.normalize(p)
        //     if (p.includes('*')) {
        //         if (glob.sync(p).includes(filePath)) {
        //             return true;
        //         }
        //     } else if (filePath === p) {
        //         return true;
        //     }
        // }
        return false;
    }

    matchPathStartwith(filePath, pathList) {
        filePath = path.normalize(filePath)
        for (let p of pathList) {
            p = path.normalize(p)
            if (filePath.startsWith(p)) {
                return p;
            }
        }
        return false;
    }

    pathReplace(filePath, a, b) {
        filePath = path.normalize(filePath)
        a = path.normalize(a)
        b = path.normalize(b)
        filePath = filePath.replace(a, b)
        return filePath;
    }

    get_bin(filename = '',) {
        let bin = path.join(__dirname, '../../../static/bin')
        if (filename) {
            bin = path.join(bin, filename)
        }
        return bin
    }

    get_static(filename = '',) {
        let bin = path.join(__dirname, '../../../static')
        if (filename) {
            bin = path.join(bin, filename)
        }
        return bin
    }

    get_core_dir(filename = '',){
        let bin = path.join(__dirname, '../../')
        if (filename) {
            bin = path.join(bin, filename)
        }
        return bin
    }

    get_src_dir(filename = '',){
        let bin = path.join(__dirname, '../../../')
        if (filename) {
            bin = path.join(bin, filename)
        }
        return bin
    }

    get_html_raw(filename = '',) {
        return this.get_html_dir(filename)
    }

    get_stylesheet(filename = '',) {
        let bin = this.get_static(`stylesheet`)
        if (filename) {
            bin = path.join(bin, filename)
        }
        return bin
    }

    isImageFile(filePath) {
        if (!this.isFile(filePath)) {
            return false
        }
        const ext = path.extname(filePath).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.ico'];
        return imageExtensions.includes(ext);
    }

    get_html_raw_dir(filename = '',) {
        let bin = path.join(__dirname, '../../../static/html_raw')
        if (filename) {
            bin = path.join(bin, filename)
        }
        return bin
    }

    isLocked(fPath) {
        if (fs.existsSync(fPath)) {
            if (this.isDir(fPath)) {
                return this.isDirectoryLocked(fPath)
            } else {
                return this.isFileLocked(fPath)
            }
        }
        return false
    }

    isFileLocked(filePath) {
        if (!fs.existsSync(filePath)) {
            return false
        }
        try {
            const fd = fs.openSync(filePath, 'r+');
            fs.closeSync(fd);
            return false;
        } catch (error) {
            if (error.code === 'EBUSY' || error.code === 'EPERM') {
                return true;
            }
            return false
        }
    }

    isDirectoryLocked(dirPath) {
        if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
            return false;
        }

        const tempName = path.join(path.dirname(dirPath), `temp_${Date.now()}_${path.basename(dirPath)}`);
        try {
            fs.renameSync(dirPath, tempName);
            fs.renameSync(tempName, dirPath);
            return false;
        } catch (error) {
            if (error.code === 'EBUSY' || error.code === 'EPERM') {
                return true;
            }
            return false;
        }
    }

    cleanOldFiles(directory, reserve = 1, callback) {
        fs.readdir(directory, (err, files) => {
            if (err) {
                return callback(err);
            }
            if (files.length < reserve) {
                return callback(null);
            }
            let processedFiles = 0;
            const filteredFiles = [];
            files.forEach(file => {
                fs.stat(path.join(directory, file), (err, stats) => {
                    if (err) {
                        return callback(err);
                    }
                    filteredFiles.push({
                        name: file,
                        time: stats.mtime || stats.birthtime
                    });
                    processedFiles++;
                    if (processedFiles === files.length) {
                        filteredFiles.sort((a, b) => {
                            return b.time - a.time;
                        });

                        const filesToDelete = filteredFiles.slice(reserve);

                        let deletedFiles = 0;

                        filesToDelete.forEach(async fileObj => {
                            fs.unlink(path.join(directory, fileObj.name), (err) => {
                                if (err) {
                                    return callback(err);
                                }
                                deletedFiles++;
                                if (deletedFiles === filesToDelete.length) {
                                    callback(null);
                                }
                            });
                        });
                    }
                });
            });
        });
    }
    findFileByExtname(dir, extname, level = Infinity) {
        const files = [];

        function searchFilesInDirectory(currentDir, currentLevel) {
            if (currentLevel > level) {
                return;
            }

            const items = fs.readdirSync(currentDir);

            items.forEach(item => {
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);

                if (stat.isDirectory()) {
                    searchFilesInDirectory(itemPath, currentLevel + 1);
                } else if (stat.isFile() && path.extname(itemPath) === extname) {
                    files.push(itemPath);
                }
            });
        }

        searchFilesInDirectory(dir, 0);

        return files;
    }

    findFileByCurrentDirExtname(dir, extname) {
        return this.findFileByExtname(dir, extname, 1)
    }

    rename(oldPath, newPath) {
        try {
            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
            }
        } catch (e) {
            console.log(e)
        }
    }

    moveFolder(srcDir, destDir, callback) {
        const srcParent = path.dirname(srcDir);
        const destParent = path.dirname(destDir);
        console.log(`srcParent ${srcDir}`)
        console.log(`destParent ${destDir}`)
        if (srcParent === destParent) {
            fs.renameSync(srcDir, destDir);
        } else {
            this.putCopyTask(srcDir, destDir, null, (destinationPath, success, usetime, fail) => {
                setTimeout(() => {
                    this.deleteFolderAsync(srcDir);
                    if (callback) callback(destinationPath, success, usetime, fail)
                }, 500)
            }, false);
        }
    }


    putCopyTask(src, out, before, callback, info = true) {
        let startTime = new Date(); // 记录当前时间
        if (fs.existsSync(out) && this.isFile(out)) {
            if (fs.existsSync(src) && this.isFile(src)) {
                let sourcePathSize = this.getFileSize(src)
                let destinationPathSize = this.getFileSize(out)
                console.log(`destinationPathSize ${sourcePathSize}`)
                console.log(`destinationPathSize ${destinationPathSize}`)
                if (sourcePathSize == destinationPathSize) {
                    if (callback) return callback(out, true, new Date() - startTime)

                }
            }
        }
        let sid = this.get_id(src)

        if (!this.isCopyTask(sid)) {
            this.pendingTasks.push({
                src,
                out,
                sid,
                before,
                callback,
                info
            })
        }
        this.execTask()
    }

    get_md5(value) {
        const hash = crypto.createHash('md5');
        hash.update(value);
        return hash.digest('hex');
    }

    get_id(value, pre) {
        value = `` + value
        const md5 = this.get_md5(value);
        let _id = `id${md5}`
        if (pre) _id = pre + _id
        return _id;
    }

    isCopyTask(sid) {
        return this.pendingTasks.some(item => item.sid === sid);
    }

    deleteCopyTask(sid) {
        const index = this.pendingTasks.findIndex(item => item.sid === sid);
        if (index > -1) {
            this.pendingTasks.splice(index, 1);
        }
    }

    async execTask(callback, message) {
        if (!this.execTaskEvent) {
            this.execTaskEvent = setInterval(() => {
                if (this.execCountTasks >= this.maxTasks) {
                    console.log(`copying tasks is full. current tasks:${this.execCountTasks}, waiting...`);
                } else if (this.pendingTasks.length > 0) {
                    let {
                        src,
                        out,
                        sid,
                        before,
                        callback,
                        info
                    } = this.pendingTasks.shift();
                    if (!this.isFileLocked(src) && !this.isFileLocked(out)) {
                        if (before) before(src, out)
                        if (this.isFile(src)) {
                            this.execCountTasks++
                            if (message) message(`copying :${src} to ${out}.`, true)
                            this.copyFile(src, out, (destinationPath, copySuccess, timeDifference) => {
                                this.deleteCopyTask(sid)
                                if (info) {
                                    if (message) message(`copyed : ${src} to ${out}.`, true)
                                } else {
                                    console.log(`copyed : ${src} to ${out}.`)
                                }
                                this.execCountTasks--;
                                if (callback) {
                                    callback(destinationPath, copySuccess, timeDifference)
                                }
                            })
                        } else {
                            if (info) {
                            if(message)message(`copying Directory :${src} to ${out}.`, true)
                            } else {
                                console.log(`copying Directory : ${src} to ${out}.`)
                            }
                            this.copyDirectory(src, out, (
                                destinationPath,
                                success,
                                usetime,
                                fail
                            ) => {
                                this.deleteCopyTask(sid)
                                if (callback) {
                                    callback(destinationPath, success, usetime, fail)
                                }
                            }, src)
                        }
                    } else {
                        if (info) {
                            if(message)message(`File is locked, requeue, file : ${src}`, true)
                        } else {
                            console.log(`File is locked, requeue, file : ${src}`)
                        }
                        this.pendingTasks.push({
                            src,
                            out,
                            sid,
                            before,
                            callback,
                            info
                        });
                    }
                } else {
                    if (this.execCountTasks < 1) {
                        clearInterval(this.execTaskEvent)
                        this.execTaskEvent = null
                        console.log(`coping task, end monitoring.`)
                    } else {
                        console.log(`There are still ${this.execCountTasks} coping tasks, waiting`)
                    }
                }
            }, 1000)
        }
    }

    async copyFile(sourcePath, destinationPath, callback) {
        let startTime = new Date();
        try {
            // const chunkSize = 64 * 1024;
            if (!fs.existsSync(sourcePath)) {
                console.log(`no such file or directory,  ${sourcePath} `);
                if (callback) return callback(destinationPath, false, 0)
                return
            }
            if (fs.existsSync(destinationPath)) {
                if (fs.existsSync(sourcePath)) {
                    let sourcePathSize = this.getFileSize(sourcePath)
                    let destinationPathSize = this.getFileSize(destinationPath)
                    if (sourcePathSize == destinationPathSize) {
                        // console.log(`Copy success(file exists): ${sourcePath} to ${destinationPath}, callback ${callback}`);
                        if (callback) return callback(destinationPath, true, new Date() - startTime)
                    }
                }
            }
            const destinationPath_dirname = path.dirname(destinationPath);
            await this.mkdir(destinationPath_dirname);
            const sourceStream = fs.createReadStream(sourcePath);
            const destinationStream = fs.createWriteStream(destinationPath);
            sourceStream.on('error', (error) => {
                console.log(`error: ${error}`);
                if (callback) return callback(null, false, new Date() - startTime)
            });
            destinationStream.on('error', (error) => {
                console.log(`error: ${error}`);
                if (callback) return callback(null, false, new Date() - startTime)
            });
            sourceStream.on('end', () => {
                console.log(`Copy success: ${sourcePath} to ${destinationPath}`);
                if (callback) return callback(destinationPath, true, new Date() - startTime)
            });
            sourceStream.pipe(destinationStream, { end: true });
        } catch (error) {
            console.error(`Copy error: ${error}`);
            if (callback) return callback(null, false, new Date() - startTime)
        }
    }

    countFilesInDirectory(dir) {
        let count = 0;

        function walk(directory) {
            const items = fs.readdirSync(directory);

            for (const item of items) {
                const fullPath = path.join(directory, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    walk(fullPath);
                } else if (stat.isFile() || item.endsWith('.asar')) {
                    count++;
                }
            }
        }
        walk(dir);
        return count;
    }

    copyDirectory(src, out, callback) {
        let fileTatal = this.countFilesInDirectory(src)
        this.execCountTasks += fileTatal
        this.copyDirectoryCallbak[src] = {
            callback,
            fileTatal,
            usetime: 0,
            success: 0,
            fail: 0,
        }
        this.copyDirectoryQueue(src, out, callback, src)
    }

    async copyDirectoryQueue(sourcePath, destinationPath, callback, originalPath) {
        let startTime = new Date();
        try {
            if (!fs.existsSync(destinationPath)) {
                await this.mkdir(destinationPath);
            }
            let items = fs.readdirSync(sourcePath);
            for (let i = 0; i < items.length; i++) {
                let currentItem = items[i];
                let currentSourcePath = path.join(sourcePath, currentItem);
                let currentDestinationPath = path.join(destinationPath, currentItem);

                if (fs.statSync(currentSourcePath).isDirectory()) {
                    await this.copyDirectoryQueue(currentSourcePath, currentDestinationPath, callback, originalPath);
                } else {
                    this.copyFile(currentSourcePath, currentDestinationPath, (dest, success, usetime) => {
                        this.execCountTasks--;
                        this.copyDirectoryCallbak[originalPath].fileTatal--
                        this.copyDirectoryCallbak[originalPath].usetime += usetime
                        if (success) {
                            this.copyDirectoryCallbak[originalPath].success++
                        } else {
                            this.copyDirectoryCallbak[originalPath].fail++
                        }
                        if (this.copyDirectoryCallbak[originalPath].fileTatal == 0) {
                            let callbakOption = this.copyDirectoryCallbak[originalPath]
                            delete this.copyDirectoryCallbak[originalPath]
                            console.log(`Copy directory success, files ${callbakOption.fileTatal}, usetime ${callbakOption.usetime}, success ${callbakOption.success}, fail ${callbakOption.fail}`);
                            if (callback) callback(
                                destinationPath,
                                callbakOption.success,
                                callbakOption.usetime,
                                callbakOption.fail
                            );
                        }
                    })
                }
            }

        } catch (error) {
            let callbakOption = this.copyDirectoryCallbak[originalPath]
            delete this.copyDirectoryCallbak[originalPath]
            console.log(`Copy directory error ${error}, files ${callbakOption.fileTatal}, usetime ${callbakOption.usetime}, success ${callbakOption.success}, fail ${callbakOption.fail}`);
            if (callback) callback(
                destinationPath,
                callbakOption.success,
                callbakOption.usetime,
                callbakOption.fail
            );
        }
    }

    getUnusedDrives() {
        try {
            const stdout = execSync('wmic logicaldisk get name').toString();
            const usedDrives = stdout.match(/[A-Z]:/g) || [];
            const allDrives = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `${letter}:`);
            const unusedDrives = allDrives.filter(drive => !usedDrives.includes(drive));
            return unusedDrives;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    mapNetworkDriveSync(hoststr) {
        let { url, usr, pwd } = this.getShareStringUserPassword(hoststr)
        let networkDriveLetter = `networkDriveLetter_` + url.replace(/[\/\\]+/g, '_');
        let driveLetter
        if (this.hasUserData(networkDriveLetter)) {
            driveLetter = this.getUserData(networkDriveLetter)
            if (!fs.existsSync(`${driveLetter}/`)) {
                driveLetter = this.getUnusedDrives()
                driveLetter = driveLetter.shift()
            } else {
                return driveLetter
            }
        } else {
            driveLetter = this.getUnusedDrives()
            driveLetter = driveLetter.shift()
        }
        if (!driveLetter) {
            console.log(`Not remained drive: ${driveLetter}`);
            return null
        }
        let { hostname, pathname } = this.parseShareDirHostAndPath(url)

        const cmd = `net use ${driveLetter} ${hostname} ${pwd} /user:${usr}`;
        try {
            execSync(cmd);
            this.saveUserData(networkDriveLetter, driveLetter)
            return driveLetter
        } catch (error) {
            console.log(`Error mapping drive: ${error.message}`);
            return null
        }
    }

    parseShareDirHostAndPath(host) {
        host = host.replace(/^[\/\\]+|[\/\\]+$/g, '');
        const pathParts = host.split(/[\/\\]+/);
        // 根据你的描述，我们会将前两部分视为1-2级，然后其余的为2级以后的
        const hostname = `\\\\` + pathParts.slice(0, 2).join('\\');
        let pathname = pathParts.slice(2).join('\\');
        pathname = pathname.replace(/^[\/\\]+|[\/\\]+$/g, '');
        return {
            hostname, pathname
        }
    }

    getShareStringUserPassword(input) {
        let url = input.split(/[a-zA-Z0-9]+\:[a-zA-Z0-9]+/)[0]
        url = url.replace(/\/+$/, '');
        let match = /[a-zA-Z0-9]+\:[a-zA-Z0-9]+/.exec(input);
        let usr = ``, pwd = ``
        if (match) {
            match = match[0]
            match = match.split(':')
            usr = match[0]
            if (match.length > 1) {
                pwd = match[1]
            }
        }
        let result = {
            url,
            usr,
            pwd
        };
        return result
    }

    scanNetworkDirectorySync(hoststr, dir) {
        let driveLetter = this.mapNetworkDriveSync(hoststr)
        if (!driveLetter) {
            console.log(`Error scanning drive: ${driveLetter}`);
            return null
        }
        try {
            return fs.readdirSync(path.join(driveLetter, dir));
        } catch (err) {
            console.log(`Error scanning directory: ${err.message}`);
            return null
        }
    }

    openNetworkFile(hoststr, fp) {
        let { url, usr, pwd } = this.getShareStringUserPassword(hoststr)
        let { hostname, pathname } = this.parseShareDirHostAndPath(url)
        let driveLetter = this.mapNetworkDriveSync(hoststr)
        let network_map_localdir = path.join(driveLetter, pathname)
        fp = path.join(network_map_localdir, fp)
        if (fs.existsSync(fp)) {
            return this.readFile(fp)
        }
        return ``
    }

    getNetworkPath(hoststr, fp) {
        let { url, usr, pwd } = this.getShareStringUserPassword(hoststr)
        let { hostname, pathname } = this.parseShareDirHostAndPath(url)
        let driveLetter = this.mapNetworkDriveSync(hoststr)
        let network_map_localdir = path.join(driveLetter, pathname)
        if (fp) network_map_localdir = path.join(network_map_localdir, fp)
        return network_map_localdir
    }

    openNetworkJSON(hoststr, fp) {
        fp = this.openNetworkFile(hoststr, fp)
        try {
            fp = JSON.parse(fp)
        } catch (e) {
            fp = {}
        }
        return fp
    }

    replacePathByLevel(oldPath, n, newPath) {
        const segments = oldPath.split(/[\/\\]+/);
        if (n <= 0 || n > segments.length) {
            return oldPath
        }
        return this.getNormalPath(path.join(newPath, segments.slice(n).join('/')));
    }

    getLevelPath(path, n, x) {
        const segments = path.split(/[\/\\]+/);
        if (x === undefined) {
            return segments[n];
        } else {
            return segments.slice(n, x + 1).join('/');
        }
    }

    getSafeFilename(url) {
        const possibleFilename = url.split('/').pop();
        const invalidCharacters = /[<>:"/\\|?*\x00-\x1F\s]+/g;
        const safeFilename = possibleFilename.replace(invalidCharacters, '_');
        return safeFilename;
    }

    isExecutable(filePath) {
        const extname = path.extname(filePath).toLowerCase();
        const executableExtensions = ['.exe', '.bat', '.cmd', '.ps1', '.vbs'];
        return executableExtensions.includes(extname);
    }

    containsAllDirs(rootPath, dirs) {
        const contents = fs.readdirSync(rootPath);
        return dirs.every(dir => contents.includes(dir));
    }
}
module.exports = new fileUnit()

