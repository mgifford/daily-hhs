import test from 'node:test';
import assert from 'node:assert/strict';
import { runLighthouseScan } from '../../src/scanners/lighthouse-runner.js';
import { runScanGovScan } from '../../src/scanners/scangov-runner.js';
import { normalizeUrlScanResult } from '../../src/scanners/result-normalizer.js';
import { executeUrlScans, withTimeout, TimeoutError, toFailureReason } from '../../src/scanners/execution-manager.js';
import { FAILURE_REASON_CATALOG } from '../../src/scanners/status-classifier.js';

test('runLighthouseScan extracts scores and cwv status', async () => {
  const result = await runLighthouseScan('https://example.gov', {
    runImpl: async () => ({
      categories: {
        performance: { score: 0.91 },
        accessibility: { score: 0.88 },
        'best-practices': { score: 0.77 },
        seo: { score: 0.82 },
        pwa: { score: 0.33 }
      },
      audits: {
        'largest-contentful-paint': { score: 0.95 },
        'cumulative-layout-shift': { score: 0.92 },
        'interaction-to-next-paint': { score: 0.89 }
      }
    })
  });

  assert.equal(result.lighthouse_performance, 91);
  assert.equal(result.lighthouse_accessibility, 88);
  assert.equal(result.lighthouse_best_practices, 77);
  assert.equal(result.lighthouse_seo, 82);
  assert.equal(result.lighthouse_pwa, 33);
  assert.equal(result.core_web_vitals_status, 'needs_improvement');
});

test('runScanGovScan normalizes findings and unknown severities', async () => {
  const result = await runScanGovScan('https://example.gov', {
    runImpl: async () => ({
      issues: [
        {
          code: 'color-contrast',
          category: 'perceivable',
          severity: 'critical',
          message: 'Insufficient contrast',
          selector: '#header'
        },
        {
          id: 'custom-rule',
          group: 'robust',
          impact: 'blocker',
          description: 'Vendor specific issue',
          location: '.content'
        }
      ]
    })
  });

  assert.equal(result.accessibility_findings.length, 2);
  assert.equal(result.accessibility_findings[0].severity, 'critical');
  assert.equal(result.accessibility_findings[1].severity, 'unknown');
  assert.equal(result.accessibility_findings[1].source_tool, 'scangov');
});

test('normalizeUrlScanResult applies failed status and fallback finding severity', () => {
  const result = normalizeUrlScanResult({
    runId: 'run-2026-02-21-abc123',
    urlRecord: { url: 'https://example.gov', page_load_count: 1000 },
    failureReason: FAILURE_REASON_CATALOG.TIMEOUT,
    scanGovResult: {
      accessibility_findings: [
        {
          issue_code: 'foo',
          issue_category: 'bar',
          severity: 'blocker',
          message: 'Bad issue',
          selector_or_location: '#bad',
          source_tool: 'scangov'
        }
      ]
    }
  });

  assert.equal(result.scan_status, 'failed');
  assert.equal(result.failure_reason, FAILURE_REASON_CATALOG.TIMEOUT);
  assert.equal(result.accessibility_findings[0].severity, 'unknown');
});

test('executeUrlScans retries timeout and marks excluded records', async () => {
  let calls = 0;

  const lighthouseRunner = {
    runImpl: async () => {
      calls += 1;
      if (calls === 1) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      return {
        categories: {
          performance: { score: 0.9 },
          accessibility: { score: 0.9 },
          'best-practices': { score: 0.9 },
          seo: { score: 0.9 },
          pwa: { score: 0.9 }
        },
        audits: {
          'largest-contentful-paint': { score: 0.9 },
          'cumulative-layout-shift': { score: 0.9 },
          'interaction-to-next-paint': { score: 0.9 }
        }
      };
    }
  };

  const scanGovRunner = {
    runImpl: async () => ({ issues: [] })
  };

  const readabilityRunner = {
    runImpl: async () => ({})
  };

  const { results, diagnostics } = await executeUrlScans(
    [
      { url: 'https://example.gov/a', page_load_count: 100 },
      { url: 'https://example.gov/b', page_load_count: 50 }
    ],
    {
      runId: 'run-2026-02-21-abc123',
      concurrency: 2,
      timeoutMs: 10,
      maxRetries: 1,
      lighthouseRunner,
      scanGovRunner,
      readabilityRunner,
      excludePredicate: (record) => (record.url.endsWith('/b') ? FAILURE_REASON_CATALOG.EXCLUDED_BY_LIMIT : null)
    }
  );

  assert.equal(results[0].scan_status, 'success');
  assert.equal(results[0].scan_diagnostics.retry_count, 1);
  assert.equal(results[0].scan_diagnostics.timeout_count, 1);
  assert.equal(results[1].scan_status, 'excluded');
  assert.equal(results[1].failure_reason, FAILURE_REASON_CATALOG.EXCLUDED_BY_LIMIT);
  assert.equal(diagnostics.success_count, 1);
  assert.equal(diagnostics.excluded_count, 1);
  assert.equal(diagnostics.retry_count, 1);
  assert.equal(diagnostics.timeout_count, 1);
});

test('executeUrlScans marks unrecoverable scanner failures', async () => {
  const { results, diagnostics } = await executeUrlScans(
    [{ url: 'https://example.gov/fail', page_load_count: 10 }],
    {
      runId: 'run-2026-02-21-def456',
      timeoutMs: 100,
      maxRetries: 0,
      lighthouseRunner: {
        runImpl: async () => {
          throw new Error('lighthouse crashed');
        }
      },
      scanGovRunner: {
        runImpl: async () => ({ issues: [] })
      }
    }
  );

  assert.equal(results[0].scan_status, 'failed');
  assert.equal(results[0].failure_reason, FAILURE_REASON_CATALOG.EXECUTION_ERROR);
  assert.equal(diagnostics.failed_count, 1);
  assert.equal(diagnostics.failure_reasons.execution_error, 1);
});

// ---------------------------------------------------------------------------
// TimeoutError
// ---------------------------------------------------------------------------

test('TimeoutError is an instance of Error', () => {
  const err = new TimeoutError('took too long');
  assert.ok(err instanceof Error);
  assert.ok(err instanceof TimeoutError);
  assert.equal(err.name, 'TimeoutError');
  assert.equal(err.message, 'took too long');
});

// ---------------------------------------------------------------------------
// toFailureReason
// ---------------------------------------------------------------------------

test('toFailureReason returns TIMEOUT for TimeoutError instances', () => {
  const reason = toFailureReason(new TimeoutError('timed out'));
  assert.equal(reason, FAILURE_REASON_CATALOG.TIMEOUT);
});

test('toFailureReason returns MALFORMED_OUTPUT for errors with code MALFORMED_OUTPUT', () => {
  const err = new Error('bad output');
  err.code = 'MALFORMED_OUTPUT';
  const reason = toFailureReason(err);
  assert.equal(reason, FAILURE_REASON_CATALOG.MALFORMED_OUTPUT);
});

test('toFailureReason returns EXECUTION_ERROR for generic errors', () => {
  const reason = toFailureReason(new Error('something broke'));
  assert.equal(reason, FAILURE_REASON_CATALOG.EXECUTION_ERROR);
});

test('toFailureReason returns EXECUTION_ERROR for null/undefined', () => {
  assert.equal(toFailureReason(null), FAILURE_REASON_CATALOG.EXECUTION_ERROR);
  assert.equal(toFailureReason(undefined), FAILURE_REASON_CATALOG.EXECUTION_ERROR);
});

// ---------------------------------------------------------------------------
// withTimeout
// ---------------------------------------------------------------------------

test('withTimeout resolves when promise completes before timeout', async () => {
  const result = await withTimeout(Promise.resolve('done'), 1000);
  assert.equal(result, 'done');
});

test('withTimeout rejects with TimeoutError when promise exceeds timeout', async () => {
  const never = new Promise(() => {});
  await assert.rejects(
    () => withTimeout(never, 10),
    (err) => {
      assert.ok(err instanceof TimeoutError, 'should be a TimeoutError');
      assert.match(err.message, /Timed out after 10ms/);
      return true;
    }
  );
});

test('withTimeout propagates rejection from the inner promise', async () => {
  const failing = Promise.reject(new Error('inner failure'));
  await assert.rejects(() => withTimeout(failing, 1000), /inner failure/);
});

// ---------------------------------------------------------------------------
// executeUrlScans - edge cases and validation
// ---------------------------------------------------------------------------

test('executeUrlScans throws when runId is missing', async () => {
  await assert.rejects(
    () => executeUrlScans([{ url: 'https://example.gov/', page_load_count: 100 }], {}),
    /requires runId/
  );
});

test('executeUrlScans throws when concurrency is 0', async () => {
  await assert.rejects(
    () => executeUrlScans(
      [{ url: 'https://example.gov/', page_load_count: 100 }],
      { runId: 'run-abc', concurrency: 0 }
    ),
    /concurrency must be an integer greater than 0/
  );
});

test('executeUrlScans throws when concurrency is negative', async () => {
  await assert.rejects(
    () => executeUrlScans(
      [{ url: 'https://example.gov/', page_load_count: 100 }],
      { runId: 'run-abc', concurrency: -1 }
    ),
    /concurrency must be an integer greater than 0/
  );
});

test('executeUrlScans throws when maxRetries is negative', async () => {
  await assert.rejects(
    () => executeUrlScans(
      [{ url: 'https://example.gov/', page_load_count: 100 }],
      { runId: 'run-abc', maxRetries: -1 }
    ),
    /maxRetries must be an integer greater than or equal to 0/
  );
});

test('executeUrlScans returns empty results for empty input', async () => {
  const { results, diagnostics } = await executeUrlScans([], { runId: 'run-abc' });
  assert.deepEqual(results, []);
  assert.equal(diagnostics.success_count, 0);
});

test('executeUrlScans uses toFailureReason for MALFORMED_OUTPUT errors', async () => {
  const { results } = await executeUrlScans(
    [{ url: 'https://example.gov/', page_load_count: 10 }],
    {
      runId: 'run-2026-04-01-abc',
      timeoutMs: 1000,
      maxRetries: 0,
      lighthouseRunner: {
        runImpl: async () => {
          const err = new Error('unexpected output format');
          err.code = 'MALFORMED_OUTPUT';
          throw err;
        }
      },
      scanGovRunner: { runImpl: async () => ({ issues: [] }) }
    }
  );

  assert.equal(results[0].scan_status, 'failed');
  assert.equal(results[0].failure_reason, FAILURE_REASON_CATALOG.MALFORMED_OUTPUT);
});

test('executeUrlScans preserves result order with concurrency > 1', async () => {
  const urls = [
    { url: 'https://a.gov/', page_load_count: 100 },
    { url: 'https://b.gov/', page_load_count: 200 },
    { url: 'https://c.gov/', page_load_count: 300 }
  ];

  const { results } = await executeUrlScans(urls, {
    runId: 'run-order-test',
    concurrency: 3,
    timeoutMs: 5000,
    maxRetries: 0,
    lighthouseRunner: {
      runImpl: async (url) => ({
        categories: {
          performance: { score: 0.9 },
          accessibility: { score: 0.9 },
          'best-practices': { score: 0.9 },
          seo: { score: 0.9 },
          pwa: { score: 0.9 }
        },
        audits: {
          'largest-contentful-paint': { score: 0.9 },
          'cumulative-layout-shift': { score: 0.9 },
          'interaction-to-next-paint': { score: 0.9 }
        }
      })
    },
    scanGovRunner: { runImpl: async () => ({ issues: [] }) }
  });

  assert.equal(results[0].url, 'https://a.gov/');
  assert.equal(results[1].url, 'https://b.gov/');
  assert.equal(results[2].url, 'https://c.gov/');
});
