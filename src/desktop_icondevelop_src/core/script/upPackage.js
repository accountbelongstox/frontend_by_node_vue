const fs = require('fs');
const path = require('path');

// 获取命令行输入的文件路径
const inputFilePath = './package.txt';
const targetFolder = './';

if (!inputFilePath) {
  console.error('请提供输入文件路径！');
  process.exit(1);
}

// 读取输入文件
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`无法读取${inputFilePath}文件: ${err}`);
    return;
  }

  const lines = data.split('\n');
  const dependenciesToUpdate = {};

  // 解析每一行并提取版本名和版本号
  lines.forEach((line) => {
    const parts = line.split(/\s+/);
    if (parts.length >= 4) {
      const versionName = parts[0];
      const currentVersion = parts[1];
      const newVersion = parts[3];
      dependenciesToUpdate[versionName] = newVersion;
    }
  });

  // 生成时间戳
  const timestamp = new Date().getTime();

  // 读取原始的 package.json 文件
  const packageJsonPath = path.join(targetFolder, 'package.json');
  fs.readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`无法读取${packageJsonPath}文件: ${err}`);
      return;
    }

    try {
      const packageJson = JSON.parse(data);

      // 更新 dependencies、optionalDependencies 和 devDependencies 中的版本号
      const updateDependencyVersions = (dependencies) => {
        for (const dependency in dependencies) {
          if (dependenciesToUpdate[dependency]) {
            dependencies[dependency] = dependenciesToUpdate[dependency];
          }
        }
      };

      if (packageJson.dependencies) {
        updateDependencyVersions(packageJson.dependencies);
      }

      if (packageJson.optionalDependencies) {
        updateDependencyVersions(packageJson.optionalDependencies);
      }

      if (packageJson.devDependencies) {
        updateDependencyVersions(packageJson.devDependencies);
      }

      // 保存更新后的 package.json 为 package.update.json
      const updatedPackageJson = JSON.stringify(packageJson, null, 2);
      const updatePackageJsonPath = path.join(targetFolder, `package.update.${timestamp}.json`);
      fs.writeFile(updatePackageJsonPath, updatedPackageJson, 'utf8', (err) => {
        if (err) {
          console.error(`无法写入${updatePackageJsonPath}文件: ${err}`);
          return;
        }
        console.log(`已成功更新${updatePackageJsonPath}`);
      });

      // 备份原始的 package.json 为 package.时间戳.json
      const backupPackageJsonPath = path.join(targetFolder, `package.${timestamp}.json`);
      fs.copyFile(packageJsonPath, backupPackageJsonPath, (err) => {
        if (err) {
          console.error(`无法备份${packageJsonPath}文件: ${err}`);
          return;
        }
        console.log(`已成功备份原始的${packageJsonPath}为${backupPackageJsonPath}`);
      });
    } catch (error) {
      console.error(`解析${packageJsonPath}文件时出错: ${error}`);
    }
  });
});
