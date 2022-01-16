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
  VariableStatement,
  VariableDeclaration,
  IfStatement,
  AdditiveExpression,
  RelationalExpression,
  BooleanLiteral,
  NullLiteral,
  LogicalExpression,
  UnaryExpression,
  WhileStatement,
  DoWhileStatement,
  ForStatement,
  FunctionDeclaration,
  ReturnStatement,
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
  IDENTIFIER,
  LET,
  COMMA,
  IF,
  ELSE,
  RELATIONAL_OPERATOR,
  EQUALITY_OPERATOR,
  TRUE,
  FALSE,
  NULL,
  LOGICAL_AND,
  LOGICAL_OR,
  LOGICAL_NOT,
  WHILE,
  DO,
  FOR,
  DEF,
  RETURN
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
      case IF:
        return this.IfStatement()
      case OPEN_CURLY_BRACE:
        return this.BlockStatement()
      case LET:
        return this.VariableStatement()
      case DEF:
        return this.FunctionDeclaration()
      case RETURN:
        return this.ReturnStatement()
      case WHILE:
      case DO:
      case FOR:
        return this.IterationStatement()
      default:
        return this.ExpressionStatement()
    }
  }

  FunctionDeclaration() {
    this._eat(DEF)
    const name = this.Identifier()

    this._eat(OPEN_PARENTHESIS)

    const params = 
      this._lookahead.type !== CLOSE_PARENTHESIS ? this.FormalParameterList() : []

    this._eat(CLOSE_PARENTHESIS)

    const body = this.BlockStatement()

    return {
      type: FunctionDeclaration,
      name,
      params,
      body,
    }
  }

  FormalParameterList() {
    const params = []

    do {
      params.push(this.Identifier())
    } while (this._lookahead.type === COMMA && this._eat(COMMA))

    return params
  }

  ReturnStatement() {
    this._eat(RETURN)
    const argument = this._lookahead.type !== SEMI_COLON ? this.Expression() : null
    this._eat(SEMI_COLON)

    return {
      type: ReturnStatement,
      argument,
    }
  }

  IterationStatement() {
    switch (this._lookahead.type) {
      case WHILE:
        return this.WhileStatement()
      case DO:
        return this.DoWhileStatement()
      case FOR:
        return this.ForStatement()
    }
  }

  WhileStatement() {
    this._eat(WHILE)

    this._eat(OPEN_PARENTHESIS)
    const test = this.Expression()
    this._eat(CLOSE_PARENTHESIS)

    const body = this.Statement()

    return {
      type: WhileStatement,
      test,
      body,
    }
  }

  DoWhileStatement() {
    this._eat(DO)

    const body = this.Statement()

    this._eat(WHILE)

    this._eat(OPEN_PARENTHESIS)
    const test = this.Expression()
    this._eat(CLOSE_PARENTHESIS)
    this._eat(SEMI_COLON)

    return {
      type: DoWhileStatement,
      body,
      test,
    }
  }

  ForStatement() {
    this._eat(FOR)
    this._eat(OPEN_PARENTHESIS)

    const init = this._lookahead.type !== SEMI_COLON ? this.ForStatementInit() : null
    this._eat(SEMI_COLON)

    const test = this._lookahead.type !== SEMI_COLON ? this.Expression() : null
    this._eat(SEMI_COLON)

    const update = this._lookahead.type !== CLOSE_PARENTHESIS ? this.Expression() : null
    this._eat(CLOSE_PARENTHESIS)

    const body = this.Statement()

    return {
      type: ForStatement,
      init,
      test,
      update,
      body,
    }
  }

  ForStatementInit() {
    if (this._lookahead.type === LET) {
      return this.VariableStatementInit()
    }

    return this.Expression()
  }

  IfStatement() {
    this._eat(IF)

    this._eat(OPEN_PARENTHESIS)

    const test = this.Expression()

    this._eat(CLOSE_PARENTHESIS)

    const consequent = this.Statement()

    const alternate = this._lookahead !== null && this._lookahead.type === ELSE
      ? this._eat(ELSE) && this.Statement()
      : null

    return {
      type: IfStatement,
      test,
      consequent,
      alternate,
    }
  }

  VariableStatementInit() {
    this._eat(LET)
    const declarations = this.VariableDeclarationList()

    return {
      type: VariableStatement,
      declarations,
    }
  }

  VariableStatement() {
    const variableStatement = this.VariableStatementInit()
    this._eat(SEMI_COLON)

    return variableStatement
  }

  VariableDeclarationList() {
    const declarations = []

    do {
      declarations.push(this.VariableDeclaration())
    } while (this._lookahead.type === COMMA && this._eat(COMMA))

    return declarations
  }

  VariableDeclaration() {
    const id = this.Identifier()

    const init =
      this._lookahead.type !== SEMI_COLON && this._lookahead.type !== COMMA
        ? this.VariableInitializer()
        : null

    return {
      type: VariableDeclaration,
      id,
      init,
    }
  }

  VariableInitializer() {
    this._eat(SIMPLE_ASSIGN)
    return this.AssignmentExpression()
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
    const left = this.LogicalOrExpression()

    if (!this._isAssignmentOperator(this._lookahead.type)) return left

    return {
      type: AssignmentExpression,
      operator: this.AssignmentOperator().value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression(),
    }
  }

  EqualityExpression() {
    return this._BinaryExpression(RelationalExpression, EQUALITY_OPERATOR)
  }

  RelationalExpression() {
    return this._BinaryExpression(AdditiveExpression, RELATIONAL_OPERATOR)
  }

  LeftHandSideExpression() {
    return this.PrimaryExpression()
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

  _logicalExpression(builderName, operatorToken) {
    let left = this[builderName]()

    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value
      const right = this[builderName]()

      left = {
        type: LogicalExpression,
        operator,
        left,
        right
      }
    }

    return left
  }

  AssignmentOperator() {
    if (this._lookahead.type === SIMPLE_ASSIGN) {
      return this._eat(SIMPLE_ASSIGN)
    }
    return this._eat(COMPLEX_ASSIGN)
  }

  LogicalOrExpression() {
    return this._logicalExpression('LogicalAndExpression', LOGICAL_OR)
  }

  LogicalAndExpression() {
    return this._logicalExpression('EqualityExpression', LOGICAL_AND)
  }

  AdditiveExpression() {
    return this._BinaryExpression('MultiplicativeExpression', ADDITIVE_OPERATOR)
  }

  MultiplicativeExpression() {
    return this._BinaryExpression('UnaryExpression', MULTIPLICATIVE_OPERATOR)
  }

  UnaryExpression() {
    let operator
    switch (this._lookahead.type) {
      case ADDITIVE_OPERATOR:
        operator = this._eat(ADDITIVE_OPERATOR).value
        break
      case LOGICAL_NOT:
        operator = this._eat(LOGICAL_NOT).value
        break
    }

    if (operator != null) {
      return {
        type: UnaryExpression,
        operator,
        argument: this.UnaryExpression()
      }
    }

    return this.LeftHandSideExpression()
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
      case IDENTIFIER:
        return this.Identifier()
      default:
        return this.LeftHandSideExpression()
    }
  }

  _isLiteral(tokenType) {
    return (
      tokenType === NUMBER ||
      tokenType === STRING ||
      tokenType === TRUE ||
      tokenType === FALSE ||
      tokenType === NULL
    )
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
      case TRUE:
        return this.BooleanLiteral(true)
      case FALSE:
        return this.BooleanLiteral(false)
      case NULL:
        return this.NullLiteral()
      default:
        throw new SyntaxError(`Literal: Unexpected literal production`)
    }
  }

  BooleanLiteral(value) {
    this._eat(value ? TRUE : FALSE)

    return {
      type: BooleanLiteral,
      value,
    }
  }

  NullLiteral() {
    this._eat(NULL)

    return {
      type: NullLiteral,
      value: null,
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