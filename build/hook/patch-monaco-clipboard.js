/**
 * Monaco Editor Clipboard Patch for Electron
 *
 * Simple patch to fix clipboard functionality in Monaco Editor when running in Electron
 * GitHub Issue:
 *  - https://github.com/microsoft/monaco-editor/issues/1046
 *  - https://github.com/microsoft/monaco-editor-webpack-plugin/issues/17#issuecomment-408303369
 *  - https://github.com/microsoft/monaco-editor/issues/4855
 */

const fs = require('fs')

// Target file path
const clipboardFile = 'node_modules/monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js'
if (fs.existsSync(clipboardFile)) {
  console.log(`🔍 Processing file: ${clipboardFile}`)
  let content = fs.readFileSync(clipboardFile, 'utf8')

  // Remove platform.isWeb check to make clipboard functionality work in Electron
  content = content.replace(
    /if \(!result && platform\.isWeb\) {/g,
    '/* MQTTX Patch: Remove platform.isWeb check to fix paste in Electron\n' +
      '   Issue: https://github.com/microsoft/monaco-editor/issues/4855\n' +
      "   Electron (especially v34+) doesn't support execCommand('paste') and isn't detected as web platform */\n" +
      '            if (!result) {',
  )

  fs.writeFileSync(clipboardFile, content)
  console.log(`✅ Monaco clipboard patch applied successfully!`)
} else {
  console.log(`⚠️ File not found: ${clipboardFile}, please run yarn install first`)
}

console.log('🎉 Monaco Editor clipboard patch completed! Clipboard functionality should now work properly in Electron.')
