const fs = require('fs');

function delDir(path: string) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);
    files.forEach((file: string) => {
      const curPath = `${path}/${file}`;
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

module.exports = delDir;
