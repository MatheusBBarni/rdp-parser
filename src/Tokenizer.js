const {
  NUMBER_REGEX,
  STRING_DQ_REGEX,
  STRING_SQ_REGEX,
  WHITESPACE_REGEX,
  SL_COMMENT_REGEX,
  ML_COMMENT_REGEX,
  SEMI_COLON_REGEX,
  OPEN_CURLY_BRACE_REGEX,
  CLOSE_CURLY_BRACE_REGEX,
  ADDITIVE_OPERATOR_REGEX,
  MULTIPLICATIVE_OPERATOR_REGEX,
  OPEN_PARENTHESIS_REGEX,
  CLOSE_PARENTHESIS_REGEX,
  IDENTIFIER_REGEX,
  SIMPLE_ASSIGN_REGEX,
  COMPLEX_ASSIGN_REGEX,
  LET_REGEX,
  COMMAN_REGEX
} = require("./regex")
const {
  NUMBER,
  STRING,
  WHITESPACE,
  SL_COMMENT,
  ML_COMMENT,
  SEMI_COLON,
  OPEN_CURLY_BRACE,
  CLOSE_CURLY_BRACE,
  ADDITIVE_OPERATOR,
  MULTIPLICATIVE_OPERATOR,
  OPEN_PARENTHESIS,
  CLOSE_PARENTHESIS,
  IDENTIFIER,
  SIMPLE_ASSIGN,
  COMPLEX_ASSIGN,
  LET,
  COMMA
} = require("./tokens")

const Spec = [
  [NUMBER_REGEX, NUMBER],

  [STRING_DQ_REGEX, STRING],
  [STRING_SQ_REGEX, STRING],

  [WHITESPACE_REGEX, WHITESPACE],

  [SL_COMMENT_REGEX, SL_COMMENT],
  [ML_COMMENT_REGEX, ML_COMMENT],

  [OPEN_PARENTHESIS_REGEX, OPEN_PARENTHESIS],
  [CLOSE_PARENTHESIS_REGEX, CLOSE_PARENTHESIS],

  [OPEN_CURLY_BRACE_REGEX, OPEN_CURLY_BRACE],
  [CLOSE_CURLY_BRACE_REGEX, CLOSE_CURLY_BRACE],

  [COMMAN_REGEX, COMMA],

  [LET_REGEX, LET],

  [SEMI_COLON_REGEX, SEMI_COLON],

  [IDENTIFIER_REGEX, IDENTIFIER],

  [ADDITIVE_OPERATOR_REGEX, ADDITIVE_OPERATOR],
  [MULTIPLICATIVE_OPERATOR_REGEX, MULTIPLICATIVE_OPERATOR],

  [SIMPLE_ASSIGN_REGEX, SIMPLE_ASSIGN],
  [COMPLEX_ASSIGN_REGEX, COMPLEX_ASSIGN],
]

class Tokenizer {
  init(string) {
    this._string = string
    this._cursor = 0
  }

  isEOF() {
    return this._cursor === this._string.length
  }

  hasMoreTokens() {
    return this._cursor < this._string.length
  }

  getNextToken() {
    if (!this.hasMoreTokens()) return null

    const string = this._string.slice(this._cursor)

    for (const [regexp, tokenType] of Spec) {
      const tokenValue = this._match(regexp, string)

      if (tokenValue === null) continue

      if (tokenType === null) return this.getNextToken()

      return {
        type: tokenType,
        value: tokenValue
      }
    }

    throw new SyntaxError(`Unexpected token: "${string[0]}"`)
  }

  _match(regexp, string) {
    const matched = regexp.exec(string)

    if (matched === null) return null

    this._cursor += matched[0].length

    return matched[0]
  }
}

module.exports = {
  Tokenizer
}