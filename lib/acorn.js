const acorn = require("acorn");
const walk = require("./Walk");
const fs = require("fs");
const path = require("path");

const sourceCode = fs.readFileSync(path.join(__dirname, './file.js'), 'utf8');
const ast = acorn.parse(sourceCode, {
  ecmaVersion: 2022,
  sourceType: 'module'
});

// console.log(ast)

let indent = 0
const padding = () => ' '.repeat(indent)

ast.body.forEach(statement => {
  // console.log(statement)
  walk(statement, {
    enter(node, parent) {
      console.log(padding() + node.type + '进入')
      indent += 2
    },
    leave(node, parent) {
      indent -= 2
      console.log(padding() + node.type + '离开')
    }
  })
});




