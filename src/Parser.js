const { Tokenizer } = require('./Tokenizer')
const {
  NUMERIC_LITERAL,
  STRING_LITERAL,
  EXPRESSION_STATEMENT,
  BLOCK_STATEMENT,
  EMPTY_STATEMENT,
  BINARY_EXPRESSION,
} = require('./types')
const {
  NUMBER,
  STRING,
  SEMI_COLON,
  OPEN_CURLY_BRACE,
  CLOSE_CURLY_BRACE,
  ADDITIVE_OPERATOR,
  MULTIPLICATIVE_OPERATOR,
  OPEN_PARENTHESIS,
  CLOSE_PARENTHESIS
} = require('./tokens')

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
      body: this.StatementList()
    }
  }

  StatementList(stopLookAhead = null) {
    const statementList = [this.Statement()]

    while (this._lookahead !== null && this._lookahead.type !== stopLookAhead) {
      statementList.push(this.Statement())
    }

    return statementList
  }

  Statement() {
    switch (this._lookahead.type) {
      case SEMI_COLON:
        return this.EmptyStatement()
      case OPEN_CURLY_BRACE:
        return this.BlockStatement()
      default:
        return this.ExpressionStatement()
    }
  }

  ExpressionStatement() {
    const expression = this.Expression()
    this._eat(SEMI_COLON)
    return {
      type: EXPRESSION_STATEMENT,
      expression
    }
  }

  BlockStatement() {
    this._eat(OPEN_CURLY_BRACE)

    const body = this._lookahead.type !== CLOSE_CURLY_BRACE ? this.StatementList(CLOSE_CURLY_BRACE) : []

    this._eat(CLOSE_CURLY_BRACE)

    return {
      type: BLOCK_STATEMENT,
      body
    }
  }

  EmptyStatement() {
    this._eat(SEMI_COLON)
    return {
      type: EMPTY_STATEMENT
    }
  }

  Expression() {
    return this.AdditiveExpression()
  }

  AdditiveExpression() {
    return this._BinaryExpression('MultiplicativeExpression', ADDITIVE_OPERATOR)
  }

  MultiplicativeExpression() {
    return this._BinaryExpression('PrimaryExpression', MULTIPLICATIVE_OPERATOR)
  }

  _BinaryExpression(builderName, operatorToken) {
    let left = this[builderName]()

    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value

      const right = this[builderName]()

      left = {
        type: BINARY_EXPRESSION,
        operator,
        left,
        right
      }
    }

    return left
  }

  PrimaryExpression() {
    switch (this._lookahead.type) {
      case OPEN_PARENTHESIS:
        return this.ParenthesizedExpression()
      default:
        return this.Literal()
    }
  }

  ParenthesizedExpression() {
    this._eat(OPEN_PARENTHESIS)
    const expression = this.Expression()
    this._eat(CLOSE_PARENTHESIS)

    return expression
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