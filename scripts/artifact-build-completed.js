const fs = require('node:fs');

exports.default = function (buildResult) {
  try {
    console.log('  • building completed  rename artifact file...');
    if (!buildResult.file.includes(' ')) {
      return;
    }

    const oldFilePath = buildResult.file;
    const newfilePath = oldFilePath.replace(/ /g, '-');
    fs.renameSync(oldFilePath, newfilePath);
    buildResult.file = newfilePath;
    console.log(`  • building completed  rename file ${oldFilePath} to ${newfilePath} `);
  } catch (error) {
    console.error('  • Error renaming file:', error);
  }
};
