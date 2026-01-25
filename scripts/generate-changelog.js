const fs = require('node:fs/promises');
const path = require('node:path');
const semver = require('semver');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'CHANGELOG.md');

const owner = 'Hiram-Wong';
const repo = 'ZyPlayer';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const PER_PAGE = 100;

function normalizeVersion(tag) {
  const clean = tag.replace(/^v/i, '');
  return semver.valid(clean) || semver.valid(semver.coerce(clean));
}

async function fetchAllReleases() {
  let page = 1;
  const all = [];

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${PER_PAGE}&page=${page}`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(GITHUB_TOKEN && {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        }),
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    all.push(...data);
    page++;
  }

  return all
    .map((r) => {
      const version = normalizeVersion(r.tag_name);
      if (!version) return null;

      return {
        version,
        tag: r.tag_name,
        publishedAt: r.published_at?.slice(0, 10),
        body: r.body?.trim(),
        url: r.html_url,
      };
    })
    .filter(Boolean)
    .sort((a, b) => semver.rcompare(a.version, b.version));
}

(async () => {
  console.log('🔍 Generating CHANGELOG...');

  try {
    const releases = await fetchAllReleases();

    const content = [
      '# Changelog',
      '',
      '> All notable changes to this project will be documented in this file.',
      '',
      ...releases.map((r) => {
        return [
          `## ${r.tag} (${r.publishedAt || 'unknown'})`,
          '',
          r.body || '_No release notes provided._',
          '',
          `[View on GitHub](${r.url})`,
          '',
        ].join('\n');
      }),
    ].join('\n');

    await fs.writeFile(OUTPUT_FILE, content, 'utf8');

    console.log(`✅ CHANGELOG generated: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Failed to generate CHANGELOG:\n', error);
    process.exit(1);
  }
})();
