module.exports = test => {
  test(`
    /**
     *
     *  Multi line comment
     */
    "Hello";

    //Comment
    30;
  `, {
    type: "Program",
    body: [
      {
        type: "ExpressionStatement",
        expression: {
          type: "StringLiteral",
          value: "Hello"
        }
      },
      {
        type: "ExpressionStatement",
        expression: {
          type: "NumericLiteral",
          value: 30
        }
      }
    ]
  })
}