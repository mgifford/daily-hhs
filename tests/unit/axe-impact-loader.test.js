import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAxeImpactRules,
  getAxeImpactRuleMap,
  getPolicyNarrative,
  getTechnicalSummary,
  getRuleFpcCodes,
  getRuleWcagSc,
  getRuleEn301549Clauses,
  getFunctionalPerformanceSpec,
  getAxeImpactMetadata,
  isAxeImpactDataStale,
  getHeuristicsForAxeRule
} from '../../src/data/axe-impact-loader.js';

test('getAxeImpactMetadata returns metadata with required fields', () => {
  const metadata = getAxeImpactMetadata();

  assert.ok(typeof metadata.axe_version === 'string', 'axe_version should be a string');
  assert.ok(typeof metadata.last_updated === 'string', 'last_updated should be a string');
  assert.ok(typeof metadata.next_review_date === 'string', 'next_review_date should be a string');
  assert.ok(typeof metadata.source_url === 'string', 'source_url should be a string');
  assert.match(metadata.last_updated, /^\d{4}-\d{2}-\d{2}$/, 'last_updated should be YYYY-MM-DD');
  assert.match(metadata.next_review_date, /^\d{4}-\d{2}-\d{2}$/, 'next_review_date should be YYYY-MM-DD');
});

test('getAxeImpactRules returns object with metadata and rules array', () => {
  const data = getAxeImpactRules();

  assert.ok(data && typeof data === 'object', 'should return an object');
  assert.ok(Array.isArray(data.rules), 'rules should be an array');
  assert.ok(data.rules.length > 0, 'rules array should not be empty');
  assert.ok(data.metadata && typeof data.metadata === 'object', 'metadata should be present');
});

test('getAxeImpactRuleMap returns a Map keyed by rule_id', () => {
  const ruleMap = getAxeImpactRuleMap();

  assert.ok(ruleMap instanceof Map, 'should return a Map');
  assert.ok(ruleMap.size > 0, 'Map should not be empty');
});

test('each rule entry has required fields', () => {
  const { rules } = getAxeImpactRules();

  for (const rule of rules) {
    assert.ok(typeof rule.rule_id === 'string' && rule.rule_id.length > 0,
      `rule_id should be a non-empty string (got: ${JSON.stringify(rule.rule_id)})`);
    assert.ok(typeof rule.technical_summary === 'string' && rule.technical_summary.length > 0,
      `technical_summary missing or empty for rule: ${rule.rule_id}`);
    assert.ok(rule.policy_narrative && typeof rule.policy_narrative === 'object',
      `policy_narrative missing for rule: ${rule.rule_id}`);
    assert.ok(typeof rule.policy_narrative.title === 'string' && rule.policy_narrative.title.length > 0,
      `policy_narrative.title missing or empty for rule: ${rule.rule_id}`);
    assert.ok(typeof rule.policy_narrative.why_it_matters === 'string' && rule.policy_narrative.why_it_matters.length > 0,
      `policy_narrative.why_it_matters missing or empty for rule: ${rule.rule_id}`);
    assert.ok(Array.isArray(rule.policy_narrative.affected_demographics),
      `policy_narrative.affected_demographics should be an array for rule: ${rule.rule_id}`);
    assert.ok(rule.policy_narrative.affected_demographics.length > 0,
      `policy_narrative.affected_demographics should not be empty for rule: ${rule.rule_id}`);
  }
});

test('getPolicyNarrative returns narrative for known rule', () => {
  const narrative = getPolicyNarrative('color-contrast');

  assert.ok(narrative !== null, 'should return narrative for color-contrast');
  assert.ok(typeof narrative.title === 'string', 'title should be a string');
  assert.ok(typeof narrative.why_it_matters === 'string', 'why_it_matters should be a string');
  assert.ok(Array.isArray(narrative.affected_demographics), 'affected_demographics should be an array');
});

test('getPolicyNarrative returns narrative for target-size', () => {
  const narrative = getPolicyNarrative('target-size');

  assert.ok(narrative !== null, 'should return narrative for target-size');
  assert.ok(narrative.why_it_matters.length > 50, 'why_it_matters should be substantive');
});

test('getPolicyNarrative returns null for unknown rule', () => {
  const narrative = getPolicyNarrative('non-existent-rule-xyz');
  assert.equal(narrative, null);
});

test('getTechnicalSummary returns summary for known rule', () => {
  const summary = getTechnicalSummary('image-alt');

  assert.ok(typeof summary === 'string', 'should return a string');
  assert.ok(summary.length > 0, 'should not be empty');
});

test('getTechnicalSummary returns null for unknown rule', () => {
  const summary = getTechnicalSummary('not-a-real-rule');
  assert.equal(summary, null);
});

test('isAxeImpactDataStale returns false for future review date', () => {
  assert.equal(isAxeImpactDataStale('2025-01-01'), false);
});

test('isAxeImpactDataStale returns true for past review date', () => {
  assert.equal(isAxeImpactDataStale('2099-12-31'), true);
});

test('all AXE_TO_FPC rules have entries in the YAML', async () => {
  const { AXE_TO_FPC } = await import('../../src/data/axe-fpc-mapping.js');
  const ruleMap = getAxeImpactRuleMap();

  const missing = [];
  for (const ruleId of AXE_TO_FPC.keys()) {
    if (!ruleMap.has(ruleId)) {
      missing.push(ruleId);
    }
  }

  assert.deepEqual(
    missing,
    [],
    `The following rules from AXE_TO_FPC are missing from axe-impact-rules.yaml: ${missing.join(', ')}`
  );
});

test('rule IDs in YAML are unique', () => {
  const { rules } = getAxeImpactRules();
  const seen = new Set();
  const duplicates = [];

  for (const rule of rules) {
    if (seen.has(rule.rule_id)) {
      duplicates.push(rule.rule_id);
    }
    seen.add(rule.rule_id);
  }

  assert.deepEqual(duplicates, [], `Duplicate rule IDs in YAML: ${duplicates.join(', ')}`);
});

test('getHeuristicsForAxeRule returns heuristics for color-contrast', () => {
  // color-contrast maps to WCAG SC 1.4.3
  // SC 1.4.3 appears in heuristics 1, 6, 8, 9, 10
  const heuristics = getHeuristicsForAxeRule('color-contrast');
  assert.ok(Array.isArray(heuristics), 'should return an array');
  assert.ok(heuristics.length > 0, 'color-contrast should map to at least one heuristic');
  for (const h of heuristics) {
    assert.ok(typeof h.id === 'number', 'heuristic id should be a number');
    assert.ok(typeof h.name === 'string' && h.name.length > 0, 'heuristic name should be non-empty');
    assert.ok(typeof h.url === 'string', 'heuristic url should be a string');
    assert.ok(Array.isArray(h.wcag_sc), 'heuristic wcag_sc should be an array');
  }
});

test('getHeuristicsForAxeRule returns empty array for unknown rule', () => {
  const heuristics = getHeuristicsForAxeRule('non-existent-rule-xyz');
  assert.deepEqual(heuristics, []);
});

test('getHeuristicsForAxeRule returns no duplicates for any rule', () => {
  const { rules } = getAxeImpactRules();
  for (const rule of rules) {
    const heuristics = getHeuristicsForAxeRule(rule.rule_id);
    const ids = heuristics.map((h) => h.id);
    const unique = [...new Set(ids)];
    assert.deepEqual(ids.sort(), unique.sort(), `Duplicate heuristics returned for rule ${rule.rule_id}`);
  }
});

// ---------------------------------------------------------------------------
// getRuleFpcCodes
// ---------------------------------------------------------------------------

test('getRuleFpcCodes returns array for a known rule with FPC codes', () => {
  // color-contrast maps to visual FPC criteria
  const codes = getRuleFpcCodes('color-contrast');
  assert.ok(codes !== null, 'should return FPC codes for color-contrast');
  assert.ok(Array.isArray(codes), 'FPC codes should be an array');
  assert.ok(codes.length > 0, 'FPC codes array should not be empty');
  for (const code of codes) {
    assert.equal(typeof code, 'string', 'each FPC code should be a string');
    assert.ok(code.length > 0, 'FPC code should not be empty');
  }
});

test('getRuleFpcCodes returns null for unknown rule', () => {
  const codes = getRuleFpcCodes('non-existent-rule-xyz');
  assert.equal(codes, null);
});

test('getRuleFpcCodes all known rules with fpc_codes return arrays', () => {
  const { rules } = getAxeImpactRules();
  for (const rule of rules) {
    if (rule.fpc_codes != null) {
      const codes = getRuleFpcCodes(rule.rule_id);
      assert.ok(Array.isArray(codes), `fpc_codes for ${rule.rule_id} should be an array`);
    }
  }
});

// ---------------------------------------------------------------------------
// getRuleWcagSc
// ---------------------------------------------------------------------------

test('getRuleWcagSc returns sc, draft, and version_note for a known rule', () => {
  const wcag = getRuleWcagSc('color-contrast');
  assert.ok(wcag !== null, 'should return WCAG SC for color-contrast');
  assert.ok(Array.isArray(wcag.sc), 'sc should be an array');
  assert.ok(wcag.sc.length > 0, 'sc should not be empty');
  assert.equal(typeof wcag.draft, 'boolean', 'draft should be a boolean');
  assert.ok('version_note' in wcag, 'should include version_note field');
});

test('getRuleWcagSc returns null for unknown rule', () => {
  const wcag = getRuleWcagSc('non-existent-rule-xyz');
  assert.equal(wcag, null);
});

test('getRuleWcagSc draft defaults to false when not set in YAML', () => {
  const { rules } = getAxeImpactRules();
  for (const rule of rules) {
    if (rule.wcag_sc && !rule.wcag_sc_draft) {
      const wcag = getRuleWcagSc(rule.rule_id);
      assert.equal(wcag.draft, false, `draft should be false for ${rule.rule_id}`);
      break;
    }
  }
});

test('getRuleWcagSc version_note is null when not set in YAML', () => {
  const { rules } = getAxeImpactRules();
  for (const rule of rules) {
    if (rule.wcag_sc && !rule.wcag_version_note) {
      const wcag = getRuleWcagSc(rule.rule_id);
      assert.equal(wcag.version_note, null, `version_note should be null for ${rule.rule_id}`);
      break;
    }
  }
});

// ---------------------------------------------------------------------------
// getRuleEn301549Clauses
// ---------------------------------------------------------------------------

test('getRuleEn301549Clauses returns clauses and draft for a known rule', () => {
  // Find a rule that has EN 301 549 clauses
  const { rules } = getAxeImpactRules();
  const ruleWithClauses = rules.find((r) => Array.isArray(r.en301549_clauses) && r.en301549_clauses.length > 0);

  if (ruleWithClauses) {
    const result = getRuleEn301549Clauses(ruleWithClauses.rule_id);
    assert.ok(result !== null, 'should return clauses object');
    assert.ok(Array.isArray(result.clauses), 'clauses should be an array');
    assert.ok(result.clauses.length > 0, 'clauses should not be empty');
    assert.equal(typeof result.draft, 'boolean', 'draft should be a boolean');
  }
});

test('getRuleEn301549Clauses returns null for unknown rule', () => {
  const result = getRuleEn301549Clauses('non-existent-rule-xyz');
  assert.equal(result, null);
});

test('getRuleEn301549Clauses returns null for rule without en301549_clauses', () => {
  // Find a rule that explicitly does not have en301549_clauses
  const { rules } = getAxeImpactRules();
  const ruleWithoutClauses = rules.find((r) => !r.en301549_clauses);

  if (ruleWithoutClauses) {
    const result = getRuleEn301549Clauses(ruleWithoutClauses.rule_id);
    assert.equal(result, null, `should be null for rule without en301549_clauses: ${ruleWithoutClauses.rule_id}`);
  }
});

// ---------------------------------------------------------------------------
// getFunctionalPerformanceSpec
// ---------------------------------------------------------------------------

test('getFunctionalPerformanceSpec returns non-null object from YAML', () => {
  const spec = getFunctionalPerformanceSpec();
  assert.ok(spec !== null, 'should return functional performance spec');
  assert.equal(typeof spec, 'object', 'should be an object');
});

test('getFunctionalPerformanceSpec includes us_fpc section', () => {
  const spec = getFunctionalPerformanceSpec();
  assert.ok(spec && 'us_fpc' in spec, 'should include us_fpc section');
});

test('getFunctionalPerformanceSpec us_fpc has expected structure', () => {
  const spec = getFunctionalPerformanceSpec();
  const fpc = spec?.us_fpc;
  assert.ok(fpc && typeof fpc === 'object', 'us_fpc should be an object');
  // Should have named criteria entries (e.g., WV, WO, WH, etc.)
  const keys = Object.keys(fpc);
  assert.ok(keys.length > 0, 'us_fpc should have at least one criterion');
});
