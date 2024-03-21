const fs = require('fs');
const path = require('path');

function processHTMLFiles(srcDir, destDir, prefix) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const files = fs.readdirSync(srcDir);

    files.forEach(file => {
        const filePath = path.join(srcDir, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isFile() && path.extname(file) === '.html') {
            let content = fs.readFileSync(filePath, 'utf8');

            // 使用正则前向断言来匹配不含<a>标签的href和src属性
            content = content.replace(/(?=<link|<script|<img|<source)([^>]+?)(href|src)="(?!http)([^"]+)"/gi, (match, precedingAttrs, attr, url) => {
                return `${precedingAttrs}${attr}="${prefix}${url}"`;
            });

            fs.writeFileSync(path.join(destDir, file), content, 'utf8');
        }
    });
}

const sourceDirectory = '../static/html';  // 你的源文件夹路径
const destinationDirectory = '../static/html_raw_dev';  // 你的目标文件夹路径
const prefixPath = '../';  // 替换的前缀路径

processHTMLFiles(sourceDirectory, destinationDirectory, prefixPath);
