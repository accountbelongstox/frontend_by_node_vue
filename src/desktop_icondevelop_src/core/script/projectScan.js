const fs = require('fs');
const path = require('path');

const ignoredExtensions = [
    '.log',
    `.woff2`,
    `.txt`,
    `.png`,
    `.icon`,
    `.icns`,
    `.jpg`,
    `.md`,
    `LICENSE`
];
const ignoredDirectories = [
    'node_modules',
    `build`,
    `.git`,
    `.vscode`,
    `.github`,
    `.next`,
    `.husky`,
    `public`,
    `target`,
];

function scanDirectory(dir, prefix = '', includeFiles = false) {
    let output = '';
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const isLast = i === entries.length - 1;

        if (entry.isDirectory() && !ignoredDirectories.includes(entry.name)) {
            output += `${prefix}${isLast ? '└──' : '├──'} ${entry.name}\n`;
            output += scanDirectory(
                path.join(dir, entry.name),
                `${prefix}${isLast ? '    ' : '│   '}`,
                includeFiles
            );
        } else if (includeFiles && entry.isFile() && !ignoredExtensions.includes(path.extname(entry.name))) {
            output += `${prefix}${isLast ? '└──' : '├──'} ${entry.name}\n`;
        }
    }

    return output;
}



const projectPath = path.join(__dirname, './');
const outputFilePath = path.join(__dirname, './project_file_tree.txt');
const outputDirPath = path.join(__dirname, './project_dir_tree.txt');
fs.writeFileSync(outputDirPath, scanDirectory(projectPath));
fs.writeFileSync(outputFilePath, scanDirectory(projectPath, '', true));


console.log(`目录树已保存到文件：${outputFilePath}`);
console.log(`目录树已保存到文件：${outputDirPath}`);
