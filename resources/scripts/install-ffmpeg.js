const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');
const { downloadWithRedirects } = require('./download');

// Base URL for downloading ffmpeg binaries
const FFMPEG_RELEASE_BASE_URL = 'https://registry.npmjs.org/@ffmpeg-installer/';
const DEFAULT_FFMPEG_VERSION = '4.1.x';

// Mapping of platform+arch to binary package name
const FFMPEG_PACKAGES = {
  'darwin-arm64': 'darwin-arm64-4.1.5.tgz',
  'darwin-x64': 'darwin-x64-4.1.0.tgz',
  // 'win32-arm64': '', // No arm64 Windows build available
  'win32-x64': 'win32-x64-4.1.0.tgz',
  'linux-arm64': 'linux-arm64-4.1.4.tgz',
  'linux-x64': 'linux-x64-4.1.0.tgz',
};

/**
 * Downloads and extracts the ffmpeg binary for the specified platform and architecture
 * @param {string} platform Platform to download for (e.g., 'darwin', 'win32', 'linux')
 * @param {string} arch Architecture to download for (e.g., 'x64', 'arm64')
 * @param {string} version Version of ffmpeg to download
 * @param {boolean} isMusl Whether to use MUSL variant for Linux
 */
async function downloadFFmpegBinary(platform, arch, version = DEFAULT_FFMPEG_VERSION, isMusl = false) {
  const platformKey = isMusl ? `${platform}-musl-${arch}` : `${platform}-${arch}`;
  const packageName = FFMPEG_PACKAGES[platformKey];

  if (!packageName) {
    console.error(`No binary available for ${platformKey}`);
    return 101;
  }

  // Create output directory structure
  const binDir = path.join(os.homedir(), '.zy', 'bin');
  // Ensure directories exist
  fs.mkdirSync(binDir, { recursive: true });

  // Download URL for the specific binary
  const downloadUrl = `${FFMPEG_RELEASE_BASE_URL}/${platformKey}/-/${packageName}`;
  const tempdir = os.tmpdir();
  const tempFilename = path.join(tempdir, `ffmpeg-${packageName}`);
  const isTarGz = packageName.endsWith('.tgz');

  try {
    console.log(`Downloading ffmpeg ${version} for ${platformKey}...`);
    console.log(`URL: ${downloadUrl}`);

    await downloadWithRedirects(downloadUrl, tempFilename);

    console.log(`Extracting ${packageName} to ${binDir}...`);

    if (isTarGz) {
      // Use tar command to extract tar.gz files (macOS and Linux)
      const tempExtractDir = path.join(tempdir, `ffmpeg-extract-${Date.now()}`);
      fs.mkdirSync(tempExtractDir, { recursive: true });

      execSync(`tar -xzf "${tempFilename}" -C "${tempExtractDir}"`, { stdio: 'inherit' });

      // Find all files in the extracted directory and move them to binDir
      const findAndMoveFiles = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            findAndMoveFiles(fullPath);
          } else {
            if (!entry.name.startsWith('ffmpeg')) continue;

            const filename = path.basename(entry.name);
            const outputPath = path.join(binDir, filename);
            fs.copyFileSync(fullPath, outputPath);
            console.log(`Extracted ${entry.name} -> ${outputPath}`);
            // Make executable on Unix-like systems
            fs.chmodSync(outputPath, 0o755);
          }
        }
      };

      findAndMoveFiles(tempExtractDir);

      // Clean up temporary extraction directory
      fs.rmSync(tempExtractDir, { recursive: true });
    }

    fs.unlinkSync(tempFilename);
    console.log(`Successfully installed ffmpeg ${version} for ${platform}-${arch}`);
    return 0;
  } catch (error) {
    let retCode = 103;

    console.error(`Error installing ffmpeg for ${platformKey}: ${error.message}`);

    if (fs.existsSync(tempFilename)) {
      fs.unlinkSync(tempFilename);
    }

    // Check if binDir is empty and remove it if so
    try {
      const files = fs.readdirSync(binDir);
      if (files.length === 0) {
        fs.rmSync(binDir, { recursive: true });
        console.log(`Removed empty directory: ${binDir}`);
      }
    } catch (cleanupError) {
      console.warn(`Warning: Failed to clean up directory: ${cleanupError.message}`);
      retCode = 104;
    }

    return retCode;
  }
}

/**
 * Detects current platform and architecture
 */
function detectPlatformAndArch() {
  const platform = os.platform();
  const arch = os.arch();
  const isMusl = platform === 'linux' && detectIsMusl();

  return { platform, arch, isMusl };
}

/**
 * Attempts to detect if running on MUSL libc
 */
function detectIsMusl() {
  try {
    // Simple check for Alpine Linux which uses MUSL
    const output = execSync('cat /etc/os-release').toString();
    return output.toLowerCase().includes('alpine');
  } catch {
    return false;
  }
}

/**
 * Main function to install ffmpeg
 */
async function installFFmpeg() {
  // Get the latest version if no specific version is provided
  const version = DEFAULT_FFMPEG_VERSION;
  console.log(`Using ffmpeg version: ${version}`);

  const { platform, arch, isMusl } = detectPlatformAndArch();

  console.log(`Installing ffmpeg ${version} for ${platform}-${arch}${isMusl ? ' (MUSL)' : ''}...`);

  return await downloadFFmpegBinary(platform, arch, version, isMusl);
}

// Run the installation
installFFmpeg()
  .then((retCode) => {
    if (retCode === 0) {
      console.log('Installation successful');
      process.exit(0);
    } else {
      console.error('Installation failed');
      process.exit(retCode);
    }
  })
  .catch((error) => {
    console.error('Installation failed:', error);
    process.exit(100);
  });
