const AST_MODE = 'default'

const DefaultFactory = {
  Program(body) {
    return {
      type: PROGRAM,
      body
    }
  },
  EmptyStatement() {
    return {
      type: EMPTY_STATEMENT
    }
  },
  BlockStatement(body) {
    return {
      type: BLOCK_STATEMENT,
      body
    }
  },
  ExpressionStatement(expression) {
    return {
      type: EXPRESSION_STATEMENT,
      expression
    }
  },
  NumericLiteral(value) {
    return {
      type: NUMERIC_LITERAL,
      value
    }
  },
  StringLiteral(value) {
    return {
      type: STRING_LITERAL,
      value
    }
  }
}

const SExpressionFactory = {
  Program(body) {
    return ['begin', body]
  },
  EmptyStatement() { },
  BlockStatement(body) {
    return ['begin', body]
  },
  ExpressionStatement(expression) {
    return expression
  },
  NumericLiteral(value) {
    return value
  },
  StringLiteral(value) {
    return `${value}`
  }
}

module.exports = AST_MODE === 'default' ? DefaultFactory : SExpressionFactory