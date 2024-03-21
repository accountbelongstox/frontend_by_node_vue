const fs = require('fs');

function mergeAndGenerateAddCommands(fileA, fileB) {
  const contentA = JSON.parse(fs.readFileSync(fileA, 'utf-8'));
  const contentB = JSON.parse(fs.readFileSync(fileB, 'utf-8'));

  let newDependencies = [];
  let newDevDependencies = [];

  for (let dep in contentB.dependencies) {
    if (!contentA.dependencies.hasOwnProperty(dep)) {
      newDependencies.push(dep + "@" + contentB.dependencies[dep]);
    }
  }

  for (let dep in contentB.devDependencies) {
    if (!contentA.devDependencies.hasOwnProperty(dep)) {
      newDevDependencies.push(dep + "@" + contentB.devDependencies[dep]);
    }
  }

  const mergedDependencies = {
    ...contentB.dependencies,
    ...contentA.dependencies,
  };

  const mergedDevDependencies = {
    ...contentB.devDependencies,
    ...contentA.devDependencies,
  };

  const addCommands = [
    ...newDependencies.length > 0 ? [`yarn add ${newDependencies.join(' ')}`] : [],
    ...newDevDependencies.length > 0 ? [`yarn add --dev ${newDevDependencies.join(' ')}`] : [],
  ];

  fs.writeFileSync('yarnAddCommands.txt', addCommands.join('\n'));

  return {
    ...contentA,
    dependencies: mergedDependencies,
    devDependencies: mergedDevDependencies,
  };
}

const fileA = './package.json';
const fileB = './oldPackage.json';


const mergedContent = mergeAndGenerateAddCommands(fileA, fileB);
fs.writeFileSync('newPackage.json', JSON.stringify(mergedContent, null, 2));

