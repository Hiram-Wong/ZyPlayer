const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const zlib = require('node:zlib');
const { execSync } = require('node:child_process');
const { downloadWithRedirects } = require('./download');

// Base URL for downloading ffprobe binaries
const FFPROBE_RELEASE_BASE_URL = 'https://github.com/eugeneware/ffmpeg-static/releases/download';
const DEFAULT_FFPROBE_VERSION = 'b6.1.1';

// Mapping of platform+arch to binary package name
const FFPROBE_PACKAGES = {
  'darwin-arm64': 'ffprobe-darwin-arm64.gz',
  'darwin-x64': 'ffprobe-darwin-x64.gz',
  // 'win32-arm64': '', // No arm64 Windows build available
  // 'win32-ia32': '', // No ia32 Windows build available
  'win32-x64': 'ffprobe-win32-x64.gz',
  'linux-arm64': 'ffprobe-linux-arm64.gz',
  'linux-ia32': 'ffprobe-linux-ia32.gz',
  'linux-x64': 'ffprobe-linux-x64.gz',
};

/**
 * Downloads and extracts the ffprobe binary for the specified platform and architecture
 * @param {string} platform Platform to download for (e.g., 'darwin', 'win32', 'linux')
 * @param {string} arch Architecture to download for (e.g., 'x64', 'arm64')
 * @param {string} version Version of ffprobe to download
 * @param {boolean} isMusl Whether to use MUSL variant for Linux
 */
async function downloadFFprobeBinary(platform, arch, version = DEFAULT_FFPROBE_VERSION, isMusl = false) {
  const platformKey = isMusl ? `${platform}-musl-${arch}` : `${platform}-${arch}`;
  const packageName = FFPROBE_PACKAGES[platformKey];

  if (!packageName) {
    console.error(`No binary available for ${platformKey}`);
    return 101;
  }

  // Create output directory structure
  const binDir = path.join(os.homedir(), '.zy', 'bin');
  // Ensure directories exist
  fs.mkdirSync(binDir, { recursive: true });

  // Download URL for the specific binary
  const downloadUrl = `${FFPROBE_RELEASE_BASE_URL}/${version}/${packageName}`;
  const tempdir = os.tmpdir();
  const tempFilename = path.join(tempdir, packageName);
  const isGz = packageName.endsWith('.gz');

  try {
    console.log(`Downloading ffprobe ${version} for ${platformKey}...`);
    console.log(`URL: ${downloadUrl}`);

    await downloadWithRedirects(downloadUrl, tempFilename);

    console.log(`Extracting ${packageName} to ${binDir}...`);

    if (isGz) {
      // Use zlib command to extract gz files
      const tempExtractDir = path.join(tempdir, `ffprobe-extract-${Date.now()}`);
      fs.mkdirSync(tempExtractDir, { recursive: true });

      const binaryName = platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';
      const compressed = fs.readFileSync(tempFilename);
      const decompressed = zlib.gunzipSync(compressed);
      fs.writeFileSync(path.join(tempExtractDir, binaryName), decompressed);

      // Find all files in the extracted directory and move them to binDir
      const findAndMoveFiles = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            findAndMoveFiles(fullPath);
          } else {
            const filename = path.basename(entry.name);
            const outputPath = path.join(binDir, filename);
            fs.copyFileSync(fullPath, outputPath);
            console.log(`Extracted ${entry.name} -> ${outputPath}`);
            // Make executable on Unix-like systems
            if (platform !== 'win32') {
              fs.chmodSync(outputPath, 0o755);
            }
          }
        }
      };

      findAndMoveFiles(tempExtractDir);

      // Clean up temporary extraction directory
      fs.rmSync(tempExtractDir, { recursive: true });
    }

    fs.unlinkSync(tempFilename);
    console.log(`Successfully installed ffprobe ${version} for ${platform}-${arch}`);
    return 0;
  } catch (error) {
    let retCode = 103;

    console.error(`Error installing ffprobe for ${platformKey}: ${error.message}`);

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
 * Main function to install ffprobe
 */
async function installFFprobe() {
  // Get the latest version if no specific version is provided
  const version = DEFAULT_FFPROBE_VERSION;
  console.log(`Using ffprobe version: ${version}`);

  const { platform, arch, isMusl } = detectPlatformAndArch();

  console.log(`Installing ffprobe ${version} for ${platform}-${arch}${isMusl ? ' (MUSL)' : ''}...`);

  return await downloadFFprobeBinary(platform, arch, version, isMusl);
}

// Run the installation
installFFprobe()
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
