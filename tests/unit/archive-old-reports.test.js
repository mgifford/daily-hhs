import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { parseArgs, getArchiveCutoffDate, archiveOldReports } from '../../src/cli/archive-old-reports.js';

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

test('parseArgs returns defaults when no arguments provided', () => {
  const args = parseArgs(['node', 'archive-old-reports.js']);
  assert.equal(args.repoRoot, null);
  assert.equal(args.displayDays, 14);
});

test('parseArgs parses --repo-root argument', () => {
  const args = parseArgs(['node', 'archive-old-reports.js', '--repo-root', '/some/path']);
  assert.equal(args.repoRoot, '/some/path');
});

test('parseArgs parses --display-days argument', () => {
  const args = parseArgs(['node', 'archive-old-reports.js', '--display-days', '30']);
  assert.equal(args.displayDays, 30);
});

test('parseArgs parses both --repo-root and --display-days together', () => {
  const args = parseArgs(['node', 'archive-old-reports.js', '--repo-root', '/repo', '--display-days', '7']);
  assert.equal(args.repoRoot, '/repo');
  assert.equal(args.displayDays, 7);
});

test('parseArgs ignores invalid --display-days and keeps default', () => {
  assert.throws(
    () => parseArgs(['node', 'archive-old-reports.js', '--display-days', 'not-a-number']),
    /--display-days must be a positive integer/
  );
});

test('parseArgs throws for zero --display-days', () => {
  assert.throws(
    () => parseArgs(['node', 'archive-old-reports.js', '--display-days', '0']),
    /--display-days must be a positive integer/
  );
});

test('parseArgs throws for negative --display-days', () => {
  assert.throws(
    () => parseArgs(['node', 'archive-old-reports.js', '--display-days', '-5']),
    /--display-days must be a positive integer/
  );
});

test('parseArgs throws for float --display-days', () => {
  assert.throws(
    () => parseArgs(['node', 'archive-old-reports.js', '--display-days', '1.5']),
    /--display-days must be a positive integer/
  );
});

// ---------------------------------------------------------------------------
// getArchiveCutoffDate
// ---------------------------------------------------------------------------

test('getArchiveCutoffDate with displayDays=14 keeps 14-day window', () => {
  // Latest date 2024-11-15, keep 14 days (Nov 2 through Nov 15), archive before Nov 2
  const cutoff = getArchiveCutoffDate('2024-11-15', 14);
  assert.equal(cutoff, '2024-11-02');
});

test('getArchiveCutoffDate with displayDays=1 cuts off all but the latest', () => {
  // With displayDays=1, only the latest date is kept; cutoff == latestDate
  const cutoff = getArchiveCutoffDate('2024-11-15', 1);
  assert.equal(cutoff, '2024-11-15');
});

test('getArchiveCutoffDate with displayDays=30 keeps 30-day window', () => {
  // 2024-10-17 is 30 days before 2024-11-15 (0-indexed: Nov15 - 29 days = Oct17)
  const cutoff = getArchiveCutoffDate('2024-11-15', 30);
  assert.equal(cutoff, '2024-10-17');
});

test('getArchiveCutoffDate handles month boundaries correctly', () => {
  const cutoff = getArchiveCutoffDate('2024-03-01', 14);
  assert.equal(cutoff, '2024-02-17');
});

test('getArchiveCutoffDate handles year boundaries correctly', () => {
  const cutoff = getArchiveCutoffDate('2024-01-10', 14);
  assert.equal(cutoff, '2023-12-28');
});

// ---------------------------------------------------------------------------
// archiveOldReports - integration tests with temp filesystem
// ---------------------------------------------------------------------------

async function createTempRepoRoot() {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'archive-test-'));
  return tmpDir;
}

async function writeReportJson(reportsRoot, runDate, data = {}) {
  const dailyDir = path.join(reportsRoot, 'daily', runDate);
  await fs.mkdir(dailyDir, { recursive: true });
  await fs.writeFile(
    path.join(dailyDir, 'report.json'),
    JSON.stringify({ run_date: runDate, ...data }),
    'utf8'
  );
  await fs.writeFile(path.join(dailyDir, 'index.html'), '<html><body>Report</body></html>', 'utf8');
  await fs.writeFile(path.join(dailyDir, 'axe-findings.json'), '[]', 'utf8');
  await fs.writeFile(path.join(dailyDir, 'axe-findings.csv'), '', 'utf8');
}

async function writeHistoryJson(reportsRoot, entries) {
  await fs.writeFile(
    path.join(reportsRoot, 'history.json'),
    JSON.stringify({ entries }),
    'utf8'
  );
}

test('archiveOldReports returns empty result when no reports exist', async () => {
  const tmpRoot = await createTempRepoRoot();
  try {
    const docsRoot = path.join(tmpRoot, 'docs');
    await fs.mkdir(docsRoot);
    const result = await archiveOldReports({ repoRoot: tmpRoot });
    assert.deepEqual(result.archived, []);
    assert.deepEqual(result.skipped, []);
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test('archiveOldReports skips reports within display window', async () => {
  const tmpRoot = await createTempRepoRoot();
  try {
    const reportsRoot = path.join(tmpRoot, 'docs', 'reports');
    await fs.mkdir(reportsRoot, { recursive: true });
    await writeReportJson(reportsRoot, '2024-11-14');
    await writeReportJson(reportsRoot, '2024-11-15');
    await writeHistoryJson(reportsRoot, [
      { run_date: '2024-11-14', aggregate_scores: {} },
      { run_date: '2024-11-15', aggregate_scores: {} }
    ]);
    const result = await archiveOldReports({ repoRoot: tmpRoot, displayDays: 14 });
    assert.deepEqual(result.archived, []);
    assert.deepEqual(result.skipped, []);
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test('archiveOldReports archives old reports and removes large files', async () => {
  const tmpRoot = await createTempRepoRoot();
  try {
    const reportsRoot = path.join(tmpRoot, 'docs', 'reports');
    await fs.mkdir(reportsRoot, { recursive: true });

    // Create an old report and a recent report
    await writeReportJson(reportsRoot, '2024-10-01');
    await writeReportJson(reportsRoot, '2024-11-15');
    await writeHistoryJson(reportsRoot, [
      { run_date: '2024-10-01', aggregate_scores: {} },
      { run_date: '2024-11-15', aggregate_scores: {} }
    ]);

    const result = await archiveOldReports({ repoRoot: tmpRoot, displayDays: 14 });

    assert.equal(result.archived.length, 1);
    assert.equal(result.archived[0].run_date, '2024-10-01');
    assert.ok(result.archived[0].zip_filename.endsWith('.zip'));

    // Large files should be removed
    const oldDailyDir = path.join(reportsRoot, 'daily', '2024-10-01');
    const indexExists = await fs.stat(path.join(oldDailyDir, 'index.html')).then(() => true, () => false);
    const axeJsonExists = await fs.stat(path.join(oldDailyDir, 'axe-findings.json')).then(() => true, () => false);
    const axeCsvExists = await fs.stat(path.join(oldDailyDir, 'axe-findings.csv')).then(() => true, () => false);
    // index.html is replaced by the redirect stub, not removed
    assert.ok(indexExists, 'index.html should exist as redirect stub');
    assert.equal(axeJsonExists, false, 'axe-findings.json should be removed');
    assert.equal(axeCsvExists, false, 'axe-findings.csv should be removed');

    // report.json should remain
    const reportExists = await fs.stat(path.join(oldDailyDir, 'report.json')).then(() => true, () => false);
    assert.ok(reportExists, 'report.json should be retained');

    // Redirect stub should contain archived marker
    const indexContent = await fs.readFile(path.join(oldDailyDir, 'index.html'), 'utf8');
    assert.ok(indexContent.includes('data-archived="true"'), 'redirect stub should include archived marker');
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test('archiveOldReports skips directories already archived', async () => {
  const tmpRoot = await createTempRepoRoot();
  try {
    const reportsRoot = path.join(tmpRoot, 'docs', 'reports');
    await fs.mkdir(reportsRoot, { recursive: true });

    const oldDate = '2024-10-01';
    const oldDailyDir = path.join(reportsRoot, 'daily', oldDate);
    await fs.mkdir(oldDailyDir, { recursive: true });
    // Write an already-archived stub
    await fs.writeFile(
      path.join(oldDailyDir, 'index.html'),
      '<html data-archived="true">Redirect</html>',
      'utf8'
    );

    await writeReportJson(reportsRoot, '2024-11-15');
    await writeHistoryJson(reportsRoot, [
      { run_date: '2024-10-01', aggregate_scores: {} },
      { run_date: '2024-11-15', aggregate_scores: {} }
    ]);

    const result = await archiveOldReports({ repoRoot: tmpRoot, displayDays: 14 });

    assert.equal(result.archived.length, 0);
    assert.equal(result.skipped.length, 1);
    assert.equal(result.skipped[0].run_date, oldDate);
    assert.equal(result.skipped[0].reason, 'already_archived');
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test('archiveOldReports skips entries that are files not directories', async () => {
  const tmpRoot = await createTempRepoRoot();
  try {
    const reportsRoot = path.join(tmpRoot, 'docs', 'reports');
    await fs.mkdir(reportsRoot, { recursive: true });
    // Create a file named like a date in the daily folder (not a directory)
    const dailyRoot = path.join(reportsRoot, 'daily');
    await fs.mkdir(dailyRoot, { recursive: true });
    await fs.writeFile(path.join(dailyRoot, '2024-10-01'), 'not a directory', 'utf8');

    await writeReportJson(reportsRoot, '2024-11-15');
    await writeHistoryJson(reportsRoot, [
      { run_date: '2024-10-01', aggregate_scores: {} },
      { run_date: '2024-11-15', aggregate_scores: {} }
    ]);

    const result = await archiveOldReports({ repoRoot: tmpRoot, displayDays: 14 });

    assert.equal(result.skipped.length, 1);
    assert.equal(result.skipped[0].run_date, '2024-10-01');
    assert.equal(result.skipped[0].reason, 'directory_not_found');
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test('archiveOldReports uses daily directory listing when no history.json exists', async () => {
  const tmpRoot = await createTempRepoRoot();
  try {
    const reportsRoot = path.join(tmpRoot, 'docs', 'reports');
    await fs.mkdir(reportsRoot, { recursive: true });
    // No history.json - should use directory listing
    await writeReportJson(reportsRoot, '2024-11-15');
    await writeReportJson(reportsRoot, '2024-10-01');

    const result = await archiveOldReports({ repoRoot: tmpRoot, displayDays: 14 });
    // 2024-10-01 should be archived since it's older than 14 days before 2024-11-15
    assert.equal(result.archived.length, 1);
    assert.equal(result.archived[0].run_date, '2024-10-01');
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test('archiveOldReports generates archive index html', async () => {
  const tmpRoot = await createTempRepoRoot();
  try {
    const reportsRoot = path.join(tmpRoot, 'docs', 'reports');
    await fs.mkdir(reportsRoot, { recursive: true });
    await writeReportJson(reportsRoot, '2024-10-01');
    await writeReportJson(reportsRoot, '2024-11-15');
    await writeHistoryJson(reportsRoot, [
      { run_date: '2024-10-01', aggregate_scores: {} },
      { run_date: '2024-11-15', aggregate_scores: {} }
    ]);

    await archiveOldReports({ repoRoot: tmpRoot, displayDays: 14 });

    const archiveIndexPath = path.join(reportsRoot, 'archive', 'index.html');
    const indexExists = await fs.stat(archiveIndexPath).then(() => true, () => false);
    assert.ok(indexExists, 'archive/index.html should be generated');

    const indexContent = await fs.readFile(archiveIndexPath, 'utf8');
    assert.ok(indexContent.includes('2024-10-01'), 'archive index should mention the archived date');
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});
