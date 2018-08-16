var fs = require('fs');
var path = require('path');
var util = require('./util');

var filename = process.env.JEST_FILE || 'jest.json';

var output = {
  stats: {},
  failures: [],
  passes: [],
  skipped: [],
};

module.exports = function reporter(results) {
  output.stats.tests = results.numTotalTests;
  output.stats.passes = results.numPassedTests;
  output.stats.failures = results.numFailedTests;
  output.stats.duration = Date.now() - results.startTime;
  output.stats.start = new Date(results.startTime);
  output.stats.end = new Date();

  results.testResults.forEach(function suiteIterator(suiteResult) {
    if (suiteResult.testExecError) {
      throw new Error(suiteResult.testExecError.message);
    }

    suiteResult.testResults.forEach(function testIterator(testResult) {
      /* istanbul ignore else */
      if (testResult.status === 'passed') {
        output.passes.push({
          title: testResult.title,
          fullTitle: testResult.ancestorTitles + ' ' + testResult.title,
          duration: suiteResult.perfStats.end - suiteResult.perfStats.start,
          errorCount: testResult.failureMessages.length,
        });
      } else if (testResult.status === 'failed') {
        output.failures.push({
          title: testResult.title,
          fullTitle: testResult.ancestorTitles + ' ' + testResult.title,
          duration: suiteResult.perfStats.end - suiteResult.perfStats.start,
          errorCount: testResult.failureMessages.length,
          error: util.format(testResult.failureMessages),
        });
      } else if (testResult.status === 'pending') {
        output.skipped.push({
          title: testResult.title,
          fullTitle: testResult.ancestorTitles + ' ' + testResult.title,
          duration: suiteResult.perfStats.end - suiteResult.perfStats.start,
          errorCount: testResult.failureMessages.length,
        });
      }
    });
  });

  fs.writeFileSync(filename, JSON.stringify(output, null, 2), 'utf-8');
  return results;
};
