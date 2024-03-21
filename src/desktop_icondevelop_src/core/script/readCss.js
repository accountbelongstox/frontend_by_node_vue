const fs = require('fs');

fs.readFile('./style2.css', 'utf8', (err, data) => {
    if (err) {
        console.error('Failed to read file:', err);
        return;
    }

    // 使用正则表达式匹配所有类名
    const regex = /\.([a-zA-Z0-9-_]+)(?:\s|,|:|{)/g;
    let matches;
    const classNames = new Set();  // 使用Set确保结果不重复
	let html = ``
    while ((matches = regex.exec(data)) !== null) {
		html += `
		<div class="icon_show" >
		
		<i class="${matches[1]} icon_show_icon"><span class="path1"></span><span class="path2"></span><span class="path3"></span></i>
		<span>${matches[1]}</span>
		</div>
		`
        classNames.add(matches[1]);
    }

    const output = Array.from(classNames).join('\n');
    
    fs.writeFile('output.txt', output, 'utf8', err => {
        if (err) {
            console.error('Failed to write to file:', err);
            return;
        }
        console.log('Class names have been saved to output.txt');
    });    
	fs.writeFile('html-icon-show.html', html, 'utf8', err => {
        if (err) {
            console.error('Failed to write to file:', err);
            return;
        }
        console.log('Class names have been saved to output.txt');
    });
});
