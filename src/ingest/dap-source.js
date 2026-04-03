import fs from 'node:fs/promises';
import { logProgress, countByReason } from '../lib/logging.js';

function toRecord(raw, sourceDate) {
  const rawUrl = raw.url ?? raw.page ?? raw.page_url ?? raw.hostname ?? raw.domain;
  const url =
    typeof rawUrl === 'string' && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')
      ? `https://${rawUrl}`
      : rawUrl;
  const pageLoadCount =
    raw.page_load_count ?? raw.pageviews ?? raw.views ?? raw.hits ?? raw.page_loads ?? raw.visits ?? null;

  if (!url || typeof url !== 'string') {
    return null;
  }

  const hasPageLoadValue = pageLoadCount !== null && pageLoadCount !== undefined && pageLoadCount !== '';
  const numericCount = hasPageLoadValue ? Number(pageLoadCount) : Number.NaN;
  const normalizedCount = Number.isFinite(numericCount) ? numericCount : null;

  return {
    url,
    page_load_count: normalizedCount,
    source_date: raw.date ?? sourceDate
  };
}

export function normalizeDapRecords(rawRecords, { limit, sourceDate }) {
  const warnings = [];
  const excluded = [];

  const normalized = [];
  for (const raw of rawRecords) {
    const record = toRecord(raw, sourceDate);
    if (!record) {
      excluded.push({ reason: 'missing_url', raw });
      continue;
    }

    // Skip synthetic DAP placeholder entries such as "(other)" that are not real scannable URLs
    if (/^https?:\/\/\(/.test(record.url)) {
      excluded.push({ reason: 'placeholder_url', raw });
      continue;
    }

    if (record.page_load_count === null) {
      warnings.push({
        code: 'missing_page_load_count',
        url: record.url,
        message: 'Page load count missing; record retained for scans but excluded from weighted impact metrics.'
      });
    }

    normalized.push(record);
  }

  const datedRecords = normalized.filter((record) => typeof record.source_date === 'string');
  if (datedRecords.length > 0) {
    const latestDate = datedRecords.reduce((latest, record) => (record.source_date > latest ? record.source_date : latest), datedRecords[0].source_date);
    const latestOnly = normalized.filter((record) => record.source_date === latestDate);
    if (latestOnly.length > 0) {
      normalized.length = 0;
      normalized.push(...latestOnly);
    }
  }

  normalized.sort((a, b) => {
    const left = a.page_load_count ?? -1;
    const right = b.page_load_count ?? -1;
    if (right !== left) {
      return right - left;
    }
    return a.url.localeCompare(b.url);
  });

  return {
    records: normalized.slice(0, limit),
    warnings,
    excluded
  };
}

function extractArrayPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload?.items && Array.isArray(payload.items)) {
    return payload.items;
  }

  throw new Error('DAP payload did not contain an array of records.');
}

export async function fetchDapRecords({ endpoint, fetchImpl = fetch }) {
  const safeEndpoint = endpoint.replace(/([?&])api_key=[^&]*/g, '$1api_key=REDACTED');
  logProgress('INGEST', 'Fetching DAP records from API', { endpoint: safeEndpoint });

  const response = await fetchImpl(endpoint);
  logProgress('INGEST', 'DAP API response received', { status: response.status, ok: response.ok, endpoint: safeEndpoint });

  if (!response.ok) {
    throw new Error(`Failed to fetch DAP records (${response.status}) from ${endpoint}`);
  }

  const payload = await response.json();
  const records = extractArrayPayload(payload);
  logProgress('INGEST', 'DAP API raw records received', { rawCount: records.length });
  return records;
}

function buildDapEndpoint(endpoint, apiKey, { limit, date } = {}) {
  const url = new URL(endpoint);

  if (apiKey && !url.searchParams.has('api_key')) {
    url.searchParams.set('api_key', apiKey);
  }

  if (limit != null && !url.searchParams.has('limit')) {
    url.searchParams.set('limit', String(limit));
  }

  if (date && !url.searchParams.has('date')) {
    url.searchParams.set('date', date);
  }

  return url.toString();
}

function getPreviousDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day - 1));
  return d.toISOString().slice(0, 10);
}

export async function readDapRecordsFromFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8');
  const payload = JSON.parse(raw);
  return extractArrayPayload(payload);
}

export async function getNormalizedTopPages({
  endpoint,
  endpoints,
  sourceFile,
  limit,
  sourceDate,
  dapApiKey,
  fetchImpl = fetch
}) {
  let rawRecords;
  if (sourceFile) {
    logProgress('INGEST', 'Reading DAP records from file', { sourceFile });
    rawRecords = await readDapRecordsFromFile(sourceFile);
    logProgress('INGEST', 'DAP file records loaded', { rawCount: rawRecords.length });

    const result = normalizeDapRecords(rawRecords, { limit, sourceDate });

    if (result.records.length === 0) {
      logProgress('INGEST', 'WARNING: normalizeDapRecords produced 0 records', {
        rawCount: rawRecords.length,
        excludedCount: result.excluded.length,
        excludedByReason: countByReason(result.excluded),
        warningCodes: result.warnings.map((w) => w.code)
      });
    }

    return result;
  }

  // Resolve endpoints: support both singular and plural config keys
  const resolvedEndpoints = endpoints ?? (endpoint ? [endpoint] : []);
  if (resolvedEndpoints.length === 0) {
    throw new Error('No DAP endpoint(s) configured. Provide endpoint or endpoints.');
  }

  const queryDate = sourceDate ? getPreviousDate(sourceDate) : undefined;
  logProgress('INGEST', 'Resolved DAP query parameters', {
    queryDate: queryDate ?? '(none - date param omitted)',
    limit,
    hasApiKey: !!dapApiKey,
    endpointCount: resolvedEndpoints.length
  });

  // Fetch raw records from all endpoints concurrently
  const allRawRecords = (
    await Promise.all(
      resolvedEndpoints.map(async (ep) => {
        const resolvedEndpoint = buildDapEndpoint(ep, dapApiKey, { limit, date: queryDate });
        return fetchDapRecords({ endpoint: resolvedEndpoint, fetchImpl });
      })
    )
  ).flat();

  // Normalize combined records with no effective cap so all survive to dedup
  const { records: allNormalized, warnings, excluded } = normalizeDapRecords(allRawRecords, {
    limit: allRawRecords.length > 0 ? allRawRecords.length : 1,
    sourceDate
  });

  // Deduplicate by URL, summing page_load_counts across agencies
  const byUrl = new Map();
  for (const record of allNormalized) {
    if (!byUrl.has(record.url)) {
      byUrl.set(record.url, { ...record });
    } else {
      const existing = byUrl.get(record.url);
      if (existing.page_load_count !== null && record.page_load_count !== null) {
        existing.page_load_count += record.page_load_count;
      } else if (record.page_load_count !== null) {
        existing.page_load_count = record.page_load_count;
      }
    }
  }

  // Re-sort after summing and apply the real limit
  const records = [...byUrl.values()]
    .sort((a, b) => {
      const left = a.page_load_count ?? -1;
      const right = b.page_load_count ?? -1;
      if (right !== left) {
        return right - left;
      }
      return a.url.localeCompare(b.url);
    })
    .slice(0, limit);

  const result = { records, warnings, excluded };

  if (result.records.length === 0) {
    logProgress('INGEST', 'WARNING: normalizeDapRecords produced 0 records', {
      rawCount: allRawRecords.length,
      excludedCount: result.excluded.length,
      excludedByReason: countByReason(result.excluded),
      warningCodes: result.warnings.map((w) => w.code)
    });
  }

  return result;
}
