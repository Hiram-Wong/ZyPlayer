const fs = require('node:fs');
const path = require('node:path');

exports.default = async function (context) {
  const platform = context.packager.platform.name;
  if (platform === 'windows') {
    fs.rmSync(path.join(context.appOutDir, 'LICENSE.electron.txt'), { force: true });
    fs.rmSync(path.join(context.appOutDir, 'LICENSES.chromium.html'), { force: true });
  }
};
