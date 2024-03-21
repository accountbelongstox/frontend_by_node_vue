const fs = require('fs');
const path = require('path');

const {
    // app,
    // config_base,
    // events,
} = require('../component/comlib/component.js');
const {
    stringUnit,
    fileUnit,
    utilUnit,
    // frameUnit,
} = require('../component/comlib/unit.js');
const {
    httpWidget,
    // configWidget,
    // shortcutRegistrationWidget,
    winapiWidget,
    // wingetWidget,
    messageWidget,
    // zipWidget,
    htmlWidget,
    // shortcutIconWidget,
} = require('../component/comlib/widget.js');


class DirectoryScanner {
    exclude_version_strings = ['x64']
    testLanguageResults = {}

    languages = [
        { 'lan': 'python', 'isNeed': true, 'lowVersion': null },
        { 'lan': 'java', 'isNeed': true, 'lowVersion': null },
        { 'lan': 'node', 'isNeed': true, 'lowVersion': null },
        { 'lan': 'rust', 'isNeed': true, 'lowVersion': null },
        { 'lan': 'go', 'isNeed': false, 'lowVersion': null },
        { 'lan': 'ruby', 'isNeed': false, 'lowVersion': null },
        { 'lan': 'groovy', 'isNeed': false, 'lowVersion': null },
        { 'lan': 'hyperv', 'isNeed': false, 'lowVersion': null },
        { 'lan': 'wsl', 'isNeed': false, 'lowVersion': null },
        { 'lan': 'visualstudio', 'isNeed': true, 'lowVersion': null }
    ]

    constructor() { }

    async getFilesInDirectory(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (error, files) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(files);
            });
        });
    }

    trimDots(str) {
        return str.replace(/^[.]+|[.]+$/g, '');
    }

    removeSubstrings(str, substrings) {
        let result = str;
        for (const substring of substrings) {
            result = result.split(substring).join('');  // 使用split和join来删除子字符串
        }
        return result;
    }

    getVersionFrom(filename) {
        filename = path.basename(filename, path.extname(filename))
        let match = this.removeSubstrings(filename, this.exclude_version_strings)
        match = match.replace(/[^\d]+/g, `.`);
        match = this.trimDots(match)
        return match ? match : `0`;
    }

    getVersionFromCommand(version) {
        if (version === true || version === false || version === null) return version
        version = stringUnit.findFirstNumberInString(version)
        version = version.replace(/^[^\d]+|[^\da-zA-Z0-9]+$/g, '');
        return version ? version : `0`;
    }

    async getPreviousData(outputPath) {
        if (!fs.existsSync(outputPath)) return {};
        const rawData = fs.readFileSync(outputPath, 'utf-8');
        return JSON.parse(rawData);
    }

    async generateJSON(directory, outputPath) {
        const files = await this.getFilesInDirectory(directory);
        const previousData = await this.getPreviousData(outputPath);
        const result = {};

        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);

            if (stats.isFile()) {
                const version = this.getVersionFrom(file);
                const basename = path.basename(file, path.extname(file));
                const filename = file;
                const mtime = stats.mtimeMs; // last modified time
                const ctime = stats.ctimeMs; // creation time
                const size = stats.size; // file size in bytes
                const ext = path.extname(file).substring(1); // file extension

                let modifyCount = 0;
                if (previousData[basename] && previousData[basename].mtime !== mtime) {
                    if (!previousData[basename].modifyCount) previousData[basename].modifyCount = 0
                    modifyCount = previousData[basename].modifyCount + 1;
                }

                result[basename] = {
                    basename: basename,
                    filename: filename,
                    version: version,
                    ctime: ctime,
                    mtime: mtime,
                    size: size,
                    type: ext,
                    modifyCount: modifyCount
                };
            }
        }

        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    }

    processDirectories(dirsAndOutputs) {
        for (const [directory, outputPath] of dirsAndOutputs) {
            this.generateJSON(directory, outputPath)
                .then(() => {
                    console.log(`JSON generated for ${directory} at ${outputPath}`);
                })
                .catch(error => {
                    console.error("Error:", error);
                });
        }
    }

    testLanguageVersionsAndShowHTML(callback) {
        if (Object.keys(this.testLanguageResults).length == this.languages.length) {
            if (callback) callback(this.testLanguageResults)
        } else {
            let resultCount = 1
            this.languages.forEach(lanCon => {
                let lan = lanCon.lan
                let isNeed = lanCon.isNeed
                let lowVersion = lanCon.lowVersion
                if (!this.testLanguageResults[lan]) {
                    this.testVersion(lan, (version) => {
                        if (version) {
                            version = this.getVersionFromCommand(version)
                        }
                        this.testLanguageResults[lan] = {
                            version,
                            lan,
                            isNeed,
                            lowVersion
                        }
                        resultCount++
                        if (resultCount == this.languages.length) {
                            if (callback) callback(this.testLanguageResults)
                        }
                    })
                } else {
                    resultCount++
                }
            })
        }
    }

    testVersion(lan, callback) {
        switch (lan) {
            case 'hyperv':
                winapiWidget.isHyperVEnabled((enable) => {
                    if (callback) callback(enable)
                })
                break
            case 'wsl':
                winapiWidget.isWSL2Enabled((enable) => {
                    if (callback) callback(enable)
                })
                break
            case 'visualstudio':
                winapiWidget.isVisualStudio((enable) => {
                    if (callback) callback(enable)
                })
                break
            default:
                winapiWidget.getLanguageVersion(lan, (version) => {
                    if (callback) callback(version)
                })
        }
    }


}

// const scanner = new DirectoryScanner();

// const dirsAndOutputs = [
//     ['\\\\192.168.100.6\\programing\\lang_compiler', '\\\\192.168.100.6\\programing\\icons_config\\lang_compiler.json'],
//     ['\\\\192.168.100.6\\programing\\softs', '\\\\192.168.100.6\\programing\\icons_config\\softs.json']
// ];

// scanner.processDirectories(dirsAndOutputs);

module.exports = new DirectoryScanner();