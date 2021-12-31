const { Parser } = require('../src/Parser')

const parser = new Parser()

const program = `
  /**
  *
  *  Multi line comment
  */
  "Hello";

  //Comment
  30;
`

const ast = parser.parse(program)

console.log(JSON.stringify(ast, null, 2))