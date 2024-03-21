const fs = require('fs');

// 读取 icons_base_cache.json 文件
fs.readFile('\\\\192.168.100.6\\programing\\icons_config\\icons_base_cache_copy.json', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
    return;
  }

  const jsonData = JSON.parse(data);
  const softIcons = {};

  // 遍历 icons_base_cache.json 中的数据
  for (const key in jsonData) {

    const entry1 = jsonData[key];
    for (const key2 in entry1) {
      const entry = entry1[key2];

      const { basename, iconBase64 } = entry;
      console.log(basename, iconBase64)
      delete entry["iconBase64"]
      jsonData[key][key2] = entry
      if(!jsonData[key][key2]["default_icon"]){
        jsonData[key][key2]["default_icon"] = ""
      }
      if(!jsonData[key][key2]["default_install_dir"]){
        jsonData[key][key2]["default_install_dir"] = ""
      }
      if(!jsonData[key][key2]["install_type"]){
        jsonData[key][key2]["install_type"] = ""
      }

      // 将对象添加到 softIcons 数组中
      softIcons[basename] = { basename, iconBase64 };
    }
  }
  // console.log(jsonData)
  // 将 softIcons 数组写入 soft_icons.json 文件
  fs.writeFile('\\\\192.168.100.6\\programing\\icons_config\\icons_cache_new.json', JSON.stringify(softIcons, null, 2), (err) => {
    if (err) {
      console.error('写入文件失败:', err);
    } else {
      console.log('soft_icons.json 文件已创建成功！');
    }
  });

  // fs.writeFile('\\\\192.168.100.6\\programing\\icons_config\\icons_base_cache_new.json', JSON.stringify(jsonData, null, 2), (err) => {
  //   if (err) {
  //     console.error('写入文件失败:', err);
  //   } else {
  //     console.log('soft_icons.json 文件已创建成功！');
  //   }
  // });
});
