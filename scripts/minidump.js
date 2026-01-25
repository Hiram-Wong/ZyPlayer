const fs = require('node:fs');
const minidump = require('minidump');
const path = require('node:path');

// https://github.com/electron/electron/releases
let symbolPaths = path.join(__dirname, 'symbols');
let file = path.join(__dirname, 'crash.dmp');

const args = process.argv.slice(2);
if (args.length >= 1) file = args[0];
if (args.length >= 2) symbolPaths = args[1];

minidump.walkStack(file, symbolPaths, (error, result) => {
  if (error) {
    console.error('Minidump read error:', error);
    return;
  }

  fs.writeFileSync('dmp.txt', result.toString());
  console.log('Minidump processed successfully. Output written to dmp.txt');
});

// node minidump.js (root directory must save the name crash.dmp file)
// node minidump.js xxx/crash.dmp (specify the dmp file path)
// node minidump.js xxx/crash.dmp xxx/symbols (specify the dmp file and symbols dir path)
