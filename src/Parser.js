const { Tokenizer } = require('./Tokenizer')
const {
  NUMERIC_LITERAL,
  STRING_LITERAL,
  EXPRESSION_STATEMENT,
  BLOCK_STATEMENT,
  EMPTY_STATEMENT,
  BINARY_EXPRESSION,
  AssignmentExpression,
  Identifier,
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
  CLOSE_PARENTHESIS,
  SIMPLE_ASSIGN,
  COMPLEX_ASSIGN,
  IDENTIFIER
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
    return this.AssignmentExpression()
  }

  AssignmentExpression() {
    const left = this.AdditiveExpression()

    if (!this._isAssignmentOperator(this._lookahead.type)) return left

    return {
      type: AssignmentExpression,
      operator: this.AssignmentOperator().value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression(),
    }
  }

  LeftHandSideExpression() {
    return this.Identifier()
  }

  Identifier() {
    const name = this._eat(IDENTIFIER).value

    return {
      type: Identifier,
      name,
    }
  }

  _checkValidAssignmentTarget(node) {
    if (node.type === Identifier) return node

    throw new SyntaxError('Invalid left-hand side assignment expression.')
  }

  _isAssignmentOperator(tokenType) {
    return tokenType === SIMPLE_ASSIGN || tokenType === COMPLEX_ASSIGN
  }

  AssignmentOperator() {
    if (this._lookahead.type === SIMPLE_ASSIGN) {
      return this._eat(SIMPLE_ASSIGN)
    }
    return this._eat(COMPLEX_ASSIGN)
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
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal()
    }
    switch (this._lookahead.type) {
      case OPEN_PARENTHESIS:
        return this.ParenthesizedExpression()
      default:
        return this.LeftHandSideExpression()
    }
  }

  _isLiteral(tokenType) {
    return tokenType === NUMBER || tokenType === STRING
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