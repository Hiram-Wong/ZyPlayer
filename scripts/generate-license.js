const checker = require('license-checker');
const fs = require('node:fs/promises');
const path = require('node:path');
const { satisfies: spdxSatisfies } = require('spdx-satisfies');
const semver = require('semver');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'ThirdPartyNotices.txt');
const PACKAGE_JSON = require(path.join(ROOT_DIR, 'package.json'));

const TOP_LEVEL_DEPS = (() => {
  const pkg = PACKAGE_JSON;

  return new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]);
})();

/**
 * A general note on some black listed specific licenses:
 * - CC0
 *    This is not a valid license. It does not grant copyright of the code/asset, and does not
 *    resolve patents or other licensed work. The different claims also have no standing in court
 *    and do not provide protection to or from Google and/or third parties.
 *    We cannot use nor contribute to CC0 licenses.
 * - Public Domain
 *    Same as CC0, it is not a valid license.
 */
const LICENSE_WHITELIST = [
  // Regular valid open source licenses supported by Google.
  'MIT',
  'ISC',
  'Apache-2.0',

  'BSD-2-Clause',
  'BSD-3-Clause',
  'BSD-4-Clause',

  // All CC-BY licenses have a full copyright grant and attribution section.
  'CC-BY-3.0',
  'CC-BY-4.0',

  // Have a full copyright grant. Validated by opensource team.
  'Unlicense',

  // Combinations.
  '(AFL-2.1 OR BSD-2-Clause)',
  '(MIT OR CC-BY-3.0)',
  '(MIT OR Apache-2.0)',
  '(MIT OR BSD-3-Clause)',
];

/**
 * Name variations of SPDX licenses that some packages have.
 * Licenses not included in SPDX but accepted will be converted to MIT.
 */
const LICENSE_REPLACEMENTS = {
  // Just a longer string that our script catches. SPDX official name is the shorter one.
  'Apache License, Version 2.0': 'Apache-2.0',
  Apache2: 'Apache-2.0',
  'Apache 2.0': 'Apache-2.0',
  'AFLv2.1': 'AFL-2.1',
  // BSD is BSD-2-clause by default.
  BSD: 'BSD-2-Clause',
  'BSD-like': 'BSD-2-Clause',
  'BSD*': 'BSD-2-Clause',
  'MIT*': 'MIT',
  'Apache*': 'Apache-2.0',
  'Apache 2': 'Apache-2.0',
  'Apache v2': 'Apache-2.0',
  'Apache License 2.0': 'Apache-2.0',
};

/**
 * Specific packages to ignore, add a reason in a comment. Format: package-name@version.
 */
const IGNORED_PACKAGES = new Set([
  // no license file

  // electron
  'electron-builder',
  'electron-devtools-installer',
  'electron-icon-builder',
  'electron-publish',
  'electron-rebuild',
  'electron-to-chromium',
  'electron-vite',
  'electron',
  'electronmon',

  // outher
  'depcheck',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-prettier',
  'eslint-plugin-simple-import-sort',
  'eslint-plugin-vue-scoped-css',
  'jest-styled-components',
  'license-checker',
  'lint-staged',
  'npm-check-updates',
  'prettier',
  'pinia-plugin-persistedstate',
  'prettier-plugin-sort-json',
  'stylelint',
  'stylelint-config-standard',
  'stylelint-order',
  'typescript',
  'typescript-eslint',
  'unplugin-auto-import',
  'unplugin-vue-components',
  'vite-plugin-vue-devtools',
  'vitest',
]);

/**
 * Normalize license string to standard SPDX identifier.
 */
function normalizeLicense(license) {
  if (!license) return '';
  return LICENSE_REPLACEMENTS[license.replace(/\*$/, '')] || license;
}

/**
 * Check if the license expression is allowed.
 */
function isLicenseAllowed(licenses, whitelist) {
  const licenseExpression = Array.isArray(licenses) ? licenses.join(' OR ') : licenses;
  return whitelist.some((accepted) => {
    try {
      return spdxSatisfies(licenseExpression, accepted);
    } catch {
      const compare = (l) => accepted.includes(l) || l.includes(accepted);
      return Array.isArray(licenses) ? licenses.some(compare) : compare(licenses);
    }
  });
}

/**
 * Determine if a package passes validation.
 */
function validatePackage(pkg) {
  // if (!pkg.licenseFile) return false;
  if (IGNORED_PACKAGES.has(pkg.name)) return false;
  if (!TOP_LEVEL_DEPS.has(pkg.name)) return false;

  if (!isLicenseAllowed(pkg.licenses, LICENSE_WHITELIST)) return false;

  return true;
}

/**
 * Filter to only include the latest version of each package.
 */
function latestPackages(pkg, index, array) {
  if (!latestPackages.latestMap) {
    latestPackages.latestMap = new Map();

    for (const p of array) {
      const existing = latestPackages.latestMap.get(p.name);

      if (!existing) {
        latestPackages.latestMap.set(p.name, p);
        continue;
      }

      const v1 = p.version;
      const v2 = existing.version;

      if (semver.valid(v1) && semver.valid(v2)) {
        if (semver.gt(v1, v2)) latestPackages.latestMap.set(p.name, p);
      } else {
        if (v1 > v2) latestPackages.latestMap.set(p.name, p);
      }
    }
  }

  const newest = latestPackages.latestMap.get(pkg.name);
  return newest && newest.id === pkg.id;
}

(async () => {
  console.log('🔍 Checking licenses...');

  const licenseData = await new Promise((resolve, reject) => {
    checker.init({ start: ROOT_DIR }, (error, json) => {
      if (error) reject(error);
      else resolve(json);
    });
  });

  const validPackages = Object.entries(licenseData)
    .map(([id, info]) => ({
      id,
      name: id.split('@')?.[0],
      version: id.split('@')?.[1] ?? 'UNKNOWN',
      repository: info.repository ?? 'N/A',
      licenseFile: info.licenseFile ?? '',
      licenses: [].concat(info.licenses || []).map(normalizeLicense),
    }))
    .filter(validatePackage)
    .filter(latestPackages);

  console.log(`✅ ${validPackages.length} valid packages found.`);

  const results = await Promise.all(
    validPackages.map(async (pkg) => {
      try {
        const licenseFileName = path.basename(pkg.licenseFile).toLowerCase();
        const content = licenseFileName.startsWith('readme')
          ? `NO LICENSE CONTENT, USE ${pkg.licenses.join('')} GENERIC RULES`
          : await fs.readFile(pkg.licenseFile, 'utf8');
        const determine = [
          '---------------------------------------------------------\n\n',
          pkg.name,
          '\n',
          pkg.repository,
          '\n\n',
          content.trim(),
          '\n---------------------------------------------------------\n\n',
        ].join('');
        return determine;
      } catch (error) {
        console.warn(`⚠️ Failed to read license for ${pkg.id}: ${error.message}`);
        return '';
      }
    }),
  );

  results.unshift(
    'NOTICES',
    '\n\n',
    'This repository incorporates material as listed below or described in the code.',
    '\n\n\n',
  );
  await fs.writeFile(OUTPUT_FILE, results.join(''), { encoding: 'utf8' });

  console.log(`📄 License report generated at: ${OUTPUT_FILE}`);
})().catch((error) => {
  console.error('❌ Failed to generate license report:\n', error);
  process.exit(1);
});
