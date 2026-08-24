#!/usr/bin/env node
import {
  extractAgentRunSummary,
  isCompletedAgentStatus,
  stripPlanOnlySummary,
} from '../src/shared/js/use-data-harness.js';

const failures = [];
const check = (ok, message) => {
  if (ok) console.log(`PASS: ${message}`);
  else {
    console.error(`FAIL: ${message}`);
    failures.push(message);
  }
};

check(isCompletedAgentStatus('completed'), 'completed is a terminal success status');
check(!isCompletedAgentStatus('executing'), 'executing is not treated as complete');
check(!isCompletedAgentStatus('planning'), 'planning is not treated as complete');
check(stripPlanOnlySummary('```weeple-plan\n{"headline":"x"}\n```') === '', 'plan-only fences are stripped');
check(stripPlanOnlySummary('# Inbox\n\n3 unread') === '# Inbox\n\n3 unread', 'user answers survive stripping');
check(
  extractAgentRunSummary({
    events: [{ type: 'stage', text: 'Planning complete. Main agent is following the plan.' }],
  }) === '',
  'stage events are not treated as the user answer',
);
check(
  extractAgentRunSummary({ summary: '# Inbox\n\nDone' }) === '# Inbox\n\nDone',
  'explicit summary is used when present',
);

if (failures.length) {
  console.error(`\n${failures.length} helper check(s) failed`);
  process.exit(1);
}
console.log('\nOK: two-stage helper checks passed');
