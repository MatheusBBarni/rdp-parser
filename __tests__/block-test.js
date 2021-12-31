module.exports = test => {
  test(`
    {
      30;

      "Hello";
    }
  `, {
    type: 'Program',
    body: [
      {
        type: 'BlockStatement',
        body: [
          {
            type: "ExpressionStatement",
            expression: {
              type: "NumericLiteral",
              value: 30
            }
          },
          {
            type: "ExpressionStatement",
            expression: {
              type: "StringLiteral",
              value: "Hello"
            }
          }
        ]
      }
    ]
  })

  test(`

    {

    }
    
  `, {
    type: 'Program',
    body: [
      {
        type: 'BlockStatement',
        body: []
      }
    ]
  })

  test(`
    {
      30;
      {
        "Hello";
      }
    }
  `, {
    type: 'Program',
    body: [
      {
        type: 'BlockStatement',
        body: [
          {
            type: "ExpressionStatement",
            expression: {
              type: "NumericLiteral",
              value: 30
            }
          },
          {
            type: "BlockStatement",
            body: [
              {
                type: "ExpressionStatement",
                expression: {
                  type: "StringLiteral",
                  value: "Hello"
                }
              }
            ]
          }
        ]
      }
    ]
  })
}