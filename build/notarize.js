const { notarize } = require('electron-notarize')

module.exports = async (context) => {
  if (process.platform !== 'darwin') return

  console.log('aftersign hook triggered, start to notarize app.')

  if (!process.env.CI) {
    console.log(`skipping notarizing, not in CI.`)
    return
  }

  if (!('APPLE_ID' in process.env && 'APPLE_ID_PASS' in process.env)) {
    console.warn('skipping notarizing, APPLE_ID and APPLE_ID_PASS env variables must be set.')
    return
  }

  const appId = 'com.electron.app'

  const { appOutDir } = context

  const appName = context.packager.appInfo.productFilename

  try {
    await notarize({
      appBundleId: appId,
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLEIDPASS
    })
  } catch (error) {
    console.error(error)
  }

  console.log(`done notarizing ${appId}.`)
}
