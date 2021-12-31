const assert = require('assert')

const { Parser } = require('../src/Parser')

const parser = new Parser()

const tests = [
  require('./literals-test.js'),
  require('./statement-list-test')
]

function test(program, expected) {
  const ast = parser.parse(program)
  assert.deepEqual(ast, expected)
}

tests.forEach(testRun => testRun(test))

console.log('All tests passed')