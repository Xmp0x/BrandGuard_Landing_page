#!/usr/bin/env node
/**
 * BrandGuard Landing Page V2 — Opaque-Box E2E Test Runner
 *
 * Self-contained, zero-external-framework test runner.
 * Provides describe/test/expect syntax, async support, milestone & tier tagging,
 * colorized diagnostics, and granular summary reporting.
 *
 * Usage:
 *   node tests/runner.js                  # Run all tests
 *   node tests/runner.js --tier=1         # Run only Tier 1
 *   node tests/runner.js --milestone=M1   # Run only Milestone 1 tests
 *   node tests/runner.js --filter=color   # Filter by test name
 *   node tests/runner.js --verbose        # Detailed diagnostic output
 */

const fs = require('fs');
const path = require('path');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Global Test Registry
const suites = [];
let currentSuite = null;
let currentTest = null;
let beforeEachFns = [];
let afterEachFns = [];
let beforeAllFns = [];
let afterAllFns = [];

/**
 * Register a test suite
 */
function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    beforeEach: [],
    afterEach: [],
    beforeAll: [],
    afterAll: [],
    parent: currentSuite,
  };

  if (currentSuite) {
    currentSuite.suites = currentSuite.suites || [];
    currentSuite.suites.push(suite);
  } else {
    suites.push(suite);
  }

  const prevSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = prevSuite;
  }
}

/**
 * Register a single test
 */
function test(name, fn, options = {}) {
  const suite = currentSuite || { name: 'Root', tests: [] };
  if (!currentSuite && !suites.includes(suite)) {
    suites.push(suite);
  }

  // Auto-detect tier from suite hierarchy or test name
  let tier = options.tier || 1;
  let s = suite;
  while (s) {
    const tierMatch = s.name.match(/Tier\s*(\d)/i);
    if (tierMatch) {
      tier = parseInt(tierMatch[1], 10);
      break;
    }
    s = s.parent;
  }
  const nameTierMatch = name.match(/Tier\s*(\d)/i);
  if (nameTierMatch) {
    tier = parseInt(nameTierMatch[1], 10);
  }

  // Auto-detect milestone tag (e.g. [M1], [M2], [M3], [M4], [M5])
  let milestone = options.milestone || 'M1';
  const mMatch = name.match(/\[(M\d)\]/i);
  if (mMatch) {
    milestone = mMatch[1].toUpperCase();
  } else {
    let sm = suite;
    while (sm) {
      const suiteMMatch = sm.name.match(/\[(M\d)\]/i);
      if (suiteMMatch) {
        milestone = suiteMMatch[1].toUpperCase();
        break;
      }
      sm = sm.parent;
    }
  }

  suite.tests.push({
    name,
    fn,
    options,
    tier,
    milestone,
    suiteName: suite.name,
    status: 'pending',
    error: null,
    durationMs: 0,
  });
}

const it = test;

function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEach.push(fn);
  else beforeEachFns.push(fn);
}

function afterEach(fn) {
  if (currentSuite) currentSuite.afterEach.push(fn);
  else afterEachFns.push(fn);
}

function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAll.push(fn);
  else beforeAllFns.push(fn);
}

function afterAll(fn) {
  if (currentSuite) currentSuite.afterAll.push(fn);
  else afterAllFns.push(fn);
}

/**
 * Assertion Library
 */
function expect(actual, defaultMessage = '') {
  const getMsg = (m, fallback) => m || defaultMessage || fallback;

  return {
    toBe(expected, message = '') {
      if (actual !== expected) {
        throw new Error(getMsg(message, `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`));
      }
    },
    toEqual(expected, message = '') {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(getMsg(message, `Expected deep equal:\n  Expected: ${expectedStr}\n  Actual:   ${actualStr}`));
      }
    },
    toBeCloseTo(expected, precision = 2, message = '') {
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -precision) / 2;
      if (diff > tolerance) {
        throw new Error(getMsg(message, `Expected ${actual} to be close to ${expected} (within ${tolerance}, diff ${diff})`));
      }
    },
    toBeTruthy(message = '') {
      if (!actual) {
        throw new Error(getMsg(message, `Expected truthy value, but got ${JSON.stringify(actual)}`));
      }
    },
    toBeFalsy(message = '') {
      if (actual) {
        throw new Error(getMsg(message, `Expected falsy value, but got ${JSON.stringify(actual)}`));
      }
    },
    toBeNull(message = '') {
      if (actual !== null) {
        throw new Error(getMsg(message, `Expected null, but got ${JSON.stringify(actual)}`));
      }
    },
    toBeDefined(message = '') {
      if (actual === undefined) {
        throw new Error(getMsg(message, `Expected defined value, but got undefined`));
      }
    },
    toContain(substrOrItem, message = '') {
      if (typeof actual === 'string') {
        if (!actual.includes(substrOrItem)) {
          throw new Error(getMsg(message, `Expected string "${actual}" to contain "${substrOrItem}"`));
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(substrOrItem)) {
          throw new Error(getMsg(message, `Expected array ${JSON.stringify(actual)} to contain ${JSON.stringify(substrOrItem)}`));
        }
      } else if (actual && typeof actual === 'object') {
        if (!(substrOrItem in actual)) {
          throw new Error(getMsg(message, `Expected object to contain key "${substrOrItem}"`));
        }
      } else {
        throw new Error(getMsg(message, `Expected containable collection, got ${typeof actual}`));
      }
    },
    toMatch(regex, message = '') {
      if (!regex.test(String(actual))) {
        throw new Error(getMsg(message, `Expected "${actual}" to match regex ${regex}`));
      }
    },
    toThrow(expectedErrorSubstr = '') {
      if (typeof actual !== 'function') {
        throw new Error(`expect(actual).toThrow() requires actual to be a function`);
      }
      let threw = false;
      let caught = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        caught = err;
      }
      if (!threw) {
        throw new Error(`Expected function to throw, but it did not throw`);
      }
      if (expectedErrorSubstr && !String(caught).includes(expectedErrorSubstr)) {
        throw new Error(`Expected error containing "${expectedErrorSubstr}", got "${caught.message || caught}"`);
      }
    },
    toHaveProperty(prop, value = undefined, message = '') {
      if (!actual || typeof actual !== 'object' || !(prop in actual)) {
        throw new Error(message || `Expected property "${prop}" in object`);
      }
      if (value !== undefined && actual[prop] !== value) {
        throw new Error(message || `Expected property "${prop}" to be ${JSON.stringify(value)}, got ${JSON.stringify(actual[prop])}`);
      }
    },
    get not() {
      return {
        toBe(expected, message = '') {
          if (actual === expected) {
            throw new Error(message || `Expected value NOT to be ${JSON.stringify(expected)}`);
          }
        },
        toEqual(expected, message = '') {
          if (JSON.stringify(actual) === JSON.stringify(expected)) {
            throw new Error(message || `Expected value NOT to equal ${JSON.stringify(expected)}`);
          }
        },
        toBeTruthy(message = '') {
          if (actual) {
            throw new Error(message || `Expected value NOT to be truthy`);
          }
        },
        toBeFalsy(message = '') {
          if (!actual) {
            throw new Error(message || `Expected value NOT to be falsy`);
          }
        },
        toBeNull(message = '') {
          if (actual === null) {
            throw new Error(message || `Expected value NOT to be null`);
          }
        },
        toContain(substrOrItem, message = '') {
          if (typeof actual === 'string' && actual.includes(substrOrItem)) {
            throw new Error(message || `Expected string NOT to contain "${substrOrItem}"`);
          }
          if (Array.isArray(actual) && actual.includes(substrOrItem)) {
            throw new Error(message || `Expected array NOT to contain ${JSON.stringify(substrOrItem)}`);
          }
        },
        toMatch(regex, message = '') {
          if (regex.test(String(actual))) {
            throw new Error(message || `Expected "${actual}" NOT to match regex ${regex}`);
          }
        },
      };
    },
  };
}

// CLI Argument Parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tier: null,
    milestone: null,
    filter: null,
    verbose: false,
    help: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      options.tier = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--milestone=')) {
      options.milestone = arg.split('=')[1].toUpperCase();
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.split('=')[1].toLowerCase();
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

// Print Help
function printHelp() {
  console.log(`
${colors.bold}${colors.cyan}BrandGuard Landing Page V2 — Test Runner${colors.reset}

${colors.bold}Usage:${colors.reset}
  node tests/runner.js [options]

${colors.bold}Options:${colors.reset}
  --tier=<1|2|3|4>      Run only tests from a specific tier
  --milestone=<M1..M5>  Run only tests mapped to a milestone
  --filter=<substring>  Filter tests by name
  --verbose, -v         Show detailed stack traces
  --help, -h            Show this help message
`);
}

// Run All Registered Tests
async function run() {
  const options = parseArgs();
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.white} BrandGuard Landing Page V2 — Opaque-Box E2E Test Runner${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.dim}Target Workspace: ${path.resolve(__dirname, '..')}${colors.reset}\n`);

  // Auto-discover test files in tests/ and tests/e2e/
  const testDirs = [
    __dirname,
    path.join(__dirname, 'e2e'),
  ];

  const loadedFiles = new Set();

  for (const dir of testDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.test.js')) {
          const baseName = path.basename(file);
          const fullPath = path.join(dir, file);
          if (!loadedFiles.has(baseName)) {
            loadedFiles.add(baseName);
            try {
              require(fullPath);
            } catch (err) {
              console.error(`${colors.red}Failed to load test file ${file}: ${err.message}${colors.reset}`);
              if (options.verbose) console.error(err.stack);
            }
          }
        }
      }
    }
  }

  // Flatten tests
  const allTests = [];
  function collectTests(suite) {
    for (const t of suite.tests) {
      allTests.push(t);
    }
    if (suite.suites) {
      for (const sub of suite.suites) {
        collectTests(sub);
      }
    }
  }

  for (const s of suites) {
    collectTests(s);
  }

  // Filter tests
  const filteredTests = allTests.filter((t) => {
    if (options.tier !== null && t.tier !== options.tier) return false;
    if (options.milestone !== null && t.milestone !== options.milestone) return false;
    if (options.filter !== null && !t.name.toLowerCase().includes(options.filter) && !t.suiteName.toLowerCase().includes(options.filter)) {
      return false;
    }
    return true;
  });

  if (filteredTests.length === 0) {
    console.log(`${colors.yellow}No tests matched the specified criteria.${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`Executing ${colors.bold}${filteredTests.length}${colors.reset} test(s)...\n`);

  // Run suite beforeAll fns
  for (const fn of beforeAllFns) {
    await fn();
  }

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  const resultsByMilestone = { M1: { pass: 0, fail: 0 }, M2: { pass: 0, fail: 0 }, M3: { pass: 0, fail: 0 }, M4: { pass: 0, fail: 0 }, M5: { pass: 0, fail: 0 } };
  const resultsByTier = { 1: { pass: 0, fail: 0 }, 2: { pass: 0, fail: 0 }, 3: { pass: 0, fail: 0 }, 4: { pass: 0, fail: 0 } };

  let lastSuiteName = '';

  for (const t of filteredTests) {
    if (t.suiteName !== lastSuiteName) {
      lastSuiteName = t.suiteName;
      console.log(`\n${colors.bold}${colors.magenta}▶ Suite: ${lastSuiteName}${colors.reset}`);
    }

    // Run beforeEach
    for (const fn of beforeEachFns) {
      await fn();
    }

    const tStart = Date.now();
    try {
      await t.fn();
      t.durationMs = Date.now() - tStart;
      t.status = 'passed';
      passed++;
      if (resultsByMilestone[t.milestone]) resultsByMilestone[t.milestone].pass++;
      if (resultsByTier[t.tier]) resultsByTier[t.tier].pass++;
      console.log(`  ${colors.green}✓${colors.reset} [${t.milestone}] [Tier ${t.tier}] ${t.name} ${colors.dim}(${t.durationMs}ms)${colors.reset}`);
    } catch (err) {
      t.durationMs = Date.now() - tStart;
      t.status = 'failed';
      t.error = err;
      failed++;
      if (resultsByMilestone[t.milestone]) resultsByMilestone[t.milestone].fail++;
      if (resultsByTier[t.tier]) resultsByTier[t.tier].fail++;
      console.log(`  ${colors.red}✗${colors.reset} [${t.milestone}] [Tier ${t.tier}] ${t.name} ${colors.dim}(${t.durationMs}ms)${colors.reset}`);
      console.log(`    ${colors.red}Error:${colors.reset} ${err.message}`);
      if (options.verbose && err.stack) {
        console.log(`    ${colors.dim}${err.stack.split('\n').slice(1, 4).join('\n    ')}${colors.reset}`);
      }
    }

    // Run afterEach
    for (const fn of afterEachFns) {
      await fn();
    }
  }

  // Run afterAll
  for (const fn of afterAllFns) {
    await fn();
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print Milestone Progression Breakdown
  console.log(`\n${colors.bold}${colors.cyan}────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log(`${colors.bold}Milestone Progression Breakdown:${colors.reset}`);
  console.log(`${colors.cyan}────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log(` Milestone | Description                            | Pass | Fail | Total | Rate`);
  console.log(`-----------|----------------------------------------|------|------|-------|------`);
  const milestoneDesc = {
    M1: 'Foundation & Layout (Sprints 1-3)       ',
    M2: 'Interactive Plugin Mockup (Sprints 4-5) ',
    M3: 'Live Demos (Sprints 6-9)                ',
    M4: 'Final Polish & Performance (10-12)      ',
    M5: 'Adversarial & Forensic Audit            ',
  };

  for (const [m, counts] of Object.entries(resultsByMilestone)) {
    const total = counts.pass + counts.fail;
    if (total > 0) {
      const rate = Math.round((counts.pass / total) * 100);
      const rateColor = rate === 100 ? colors.green : rate > 0 ? colors.yellow : colors.red;
      console.log(` ${colors.bold}${m.padEnd(9)}${colors.reset} | ${milestoneDesc[m]} | ${String(counts.pass).padStart(4)} | ${String(counts.fail).padStart(4)} | ${String(total).padStart(5)} | ${rateColor}${String(rate).padStart(3)}%${colors.reset}`);
    }
  }

  // Print Tier Breakdown
  console.log(`\n${colors.cyan}────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log(` Tier Breakdown:`);
  console.log(` Tier 1 (Features):   ${resultsByTier[1].pass} pass / ${resultsByTier[1].fail} fail`);
  console.log(` Tier 2 (Boundaries): ${resultsByTier[2].pass} pass / ${resultsByTier[2].fail} fail`);
  console.log(` Tier 3 (Pairwise):   ${resultsByTier[3].pass} pass / ${resultsByTier[3].fail} fail`);
  console.log(` Tier 4 (Scenarios):  ${resultsByTier[4].pass} pass / ${resultsByTier[4].fail} fail`);

  // Final Summary
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  if (failed === 0) {
    console.log(`${colors.bgGreen}${colors.bold}${colors.white} ALL ${passed} TESTS PASSED ${colors.reset} in ${totalDuration}s`);
  } else {
    console.log(`${colors.bgRed}${colors.bold}${colors.white} ${failed} OF ${filteredTests.length} TESTS FAILED ${colors.reset} (${passed} passed) in ${totalDuration}s`);
    console.log(`${colors.dim}Note: Unimplemented milestone features will fail until their milestone is delivered.${colors.reset}`);
  }
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  process.exit(failed === 0 ? 0 : 1);
}

// Export for module use or direct execution
module.exports = {
  describe,
  test,
  it,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  expect,
  run,
};

// If executed directly from CLI, run the suite
if (require.main === module) {
  run().catch((err) => {
    console.error(`${colors.red}Fatal test runner error: ${err.message}${colors.reset}`);
    console.error(err.stack);
    process.exit(1);
  });
}
