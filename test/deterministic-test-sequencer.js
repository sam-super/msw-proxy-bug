const TestSequencer = require('@jest/test-sequencer').default;

class DeterministicSequencer extends TestSequencer {
  sort(tests) {
    return tests.sort((testA, testB) => {
      return testA.path.localeCompare(testB.path);
    })
  }
}

module.exports = DeterministicSequencer;
