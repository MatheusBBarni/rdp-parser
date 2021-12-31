const assert = require('assert')

const { Parser } = require('../src/Parser')

const parser = new Parser()

const tests = [
  require('./block-test'),
  require('./literals-test'),
  require('./statement-list-test'),
  require('./empty-statement-test')
]

function test(program, expected) {
  const ast = parser.parse(program)
  assert.deepEqual(ast, expected)
}

tests.forEach(testRun => testRun(test))

console.log('All assertions passed!')