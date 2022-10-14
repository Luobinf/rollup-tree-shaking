const acorn = require("acorn");

console.log(acorn)

const sourceCode = 'const name = require("lodas")'
const ast = acorn.parse(sourceCode, {
  ecmaVersion: 2022,
  sourceType: 'module'
});

console.log(ast)




