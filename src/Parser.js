const { Tokenizer } = require('./Tokenizer')
const { NUMERIC_LITERAL, NUMBER, STRING, STRING_LITERAL } = require('./types')

class Parser {
  constructor() {
    this._string = ''
    this._tokenizer = new Tokenizer()
  }

  parse(string) {
    this._string = string
    this._tokenizer.init(string)

    this._lookahead = this._tokenizer.getNextToken()

    return this.Program()
  }
  Program() {
    return {
      type: 'Program',
      body: this.Literal()
    }
  }

  Literal() {
    switch (this._lookahead.type) {
      case NUMBER:
        return this.NumericLiteral()
      case STRING:
        return this.StringLiteral()
      default:
        throw new SyntaxError(`Literal: Unexpected literal production`)
    }
  }

  NumericLiteral() {
    const token = this._eat(NUMBER)
    return {
      type: NUMERIC_LITERAL,
      value: Number(token.value)
    }
  }

  StringLiteral() {
    const token = this._eat(STRING)
    return {
      type: STRING_LITERAL,
      value: token.value.slice(1, -1)
    }
  }

  _eat(tokenType) {
    const token = this._lookahead

    if (token === null) {
      throw new SyntaxError(`Unexpected end of input, expected: "${tokenType}"`)
    }

    if (token.type !== tokenType) {
      throw new SyntaxError(`Unexpected token: "${token.value}", expected: "${tokenType}"`)
    }

    this._lookahead = this._tokenizer.getNextToken()

    return token
  }
}

module.exports = {
  Parser
}