const {
  NUMBER_REGEX,
  STRING_DQ_REGEX,
  STRING_SQ_REGEX,
  WHITESPACE_REGEX,
  SL_COMMENT_REGEX,
  ML_COMMENT_REGEX,
  SEMI_COLON_REGEX
} = require("./regex")
const {
  NUMBER,
  STRING,
  WHITESPACE,
  SL_COMMENT,
  ML_COMMENT,
  SEMI_COLON
} = require("./types")

const Spec = [
  [NUMBER_REGEX, NUMBER],
  [STRING_DQ_REGEX, STRING],
  [STRING_SQ_REGEX, STRING],
  [WHITESPACE_REGEX, WHITESPACE],
  [SL_COMMENT_REGEX, SL_COMMENT],
  [ML_COMMENT_REGEX, ML_COMMENT],
  [SEMI_COLON_REGEX, SEMI_COLON]
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