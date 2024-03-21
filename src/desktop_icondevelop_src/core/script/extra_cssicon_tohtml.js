const fs = require('fs');
const path = require('path');

function generateHtmlFromCssFile(filename) {
    const cssContent = fs.readFileSync(filename, 'utf8');
    return generateHtmlFromCss(cssContent);
}

function generateHtmlFromCss(css) {
    const iconRegex = /\.icon-([a-zA-Z0-9]+) \.path(\d+):before/g;
    let match;
    const icons = {};

    while ((match = iconRegex.exec(css)) !== null) {
        const iconName = match[1];
        const pathNumber = match[2];

        if (!icons[iconName]) {
            icons[iconName] = [];
        }

        icons[iconName].push(pathNumber);
    }

    let html = '';
    for (const iconName in icons) {
        let spanHTML = '';
        icons[iconName].forEach(pathNumber => {
            spanHTML += `<span class="path${pathNumber}"></span>`;
        });
        html += `<i class="icon-${iconName}">${spanHTML}</i> icon-${iconName} path: ${icons[iconName].length}<br />`;
    }

    return html;
}

// 使用方式
const filename = path.join(__dirname, `../../static/stylesheet/css/style2.css`);
const saveHTML = path.join(__dirname, `../../static/html_raw/icon_demos.html`);
let html = generateHtmlFromCssFile(filename)
html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="">

        <title>DesktopManager</title>

        <!-- Style-->
        <link rel="stylesheet" href="../stylesheet/css/style.css">
        <link rel="stylesheet" href="../stylesheet/css/style2.css">

        <style>
        span{
            font-size:30px;
        }
        </style>
    </head>
    <body class="">
        
    <div class="">
    ${html}
    </div>
    </body>
    </html>
`
fs.writeFileSync(saveHTML, html, 'utf8');
console.log();
