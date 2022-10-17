const Scope = require("./scope");
const walk = require("./walk");
const { hasOwnProperty } = require("./utils");

function analyse(ast, code, module) {
  //第1个循环，找出导入导出的变量合集存入 module 的 imports、exports 属性中去
  ast.body.forEach((statement) => {
    Object.defineProperties(statement, {
      _module: { value: module },
      _source: { value: code.snip(statement.start, statement.end) },
      _defines: { value: {} }, //此节点定义了哪些变量
      _dependsOn: { value: {} }, //此节点读取了哪些变量
      _modifies: { value: {} }, //本语句修改的变量
    });
    //import { name as xx, age } from './msg';
    if (statement.type === "ImportDeclaration") {
      let source = statement.source.value; // ./msg
      statement.specifiers.forEach((specifier) => {
        let importName = specifier.imported.name; //导入的变量名
        let localName = specifier.local.name; //本地的变量名
        //imports.name = { source:'./msg', importName:'name' }; 从哪里来，导入的变量名是什么
        module.imports[localName] = { source, importName };
      });
    } else if (statement.type === "ExportNamedDeclaration") {
      const declaration = statement.declaration;
      // var hello = 'aaa';  export { hello as xx}
      if (!declaration) {
        const specifier = statement.specifier;
        specifier.forEach((exportSpecifier) => {
          const localName = exportSpecifier.local.name;
          const exportedName = exportSpecifier.local.exported;
          //exports.name = {exportedName: 'xx', localName:'hello'};
          module.exports[exportedName] = {
            exportedName,
            localName,
          };
        });
      }

      if (declaration && declaration.type === "VariableDeclaration") {
        const declarations = declaration.declarations;
        declarations.forEach((variableDeclarator) => {
          const localName = variableDeclarator.id.name; //name
          const exportedName = localName;
          module.exports[exportedName] = { localName, exportedName };
        });
      }
    } else if (statement.type === "ExportDefaultDeclaration") {
      const declaration = statement.declaration;
      if (declaration && typeof declaration === "Identifier") {
        const exportedName = declaration.name;
        const localName = exportedName;
        module.exports[exportedName] = { localName, exportedName };
      }
    }
  });

  //第2次循环创建作用域链
  let currentScope = new Scope({ name: "全局作用域" });
  //创建作用域链,为了知道我在此模块中声明哪些变量，这些变量的声明节点是哪个 var name = 1;
  ast.body.forEach((statement) => {
    function addToScope(name) {
      currentScope.add(name); //把name变量放入当前的作用域
      //如果没有父亲，相当 于就是根作用域或者 当前的作用域是一个块级作用域的话
      if (!currentScope.parent) {
        //如果没有父作用域，说明这是一个顶级作用域
        statement._defines[name] = true; //在一级节点定义一个变量name _defines.say=true
        module.definitions[name] = statement; // 存放模块定义变量的语句
      }
    }

    function checkForReads(node) {
      if (node.type === "Identifier") {
        statement._dependsOn[node.name] = true;
      }
    }

    function checkForWrites(node) {
      function addNode(node) {
        const name = node.name;
        statement._modifies[name] = true; //statement._modifies.age = true;
        if (!hasOwnProperty(module.modifications, name)) {
          module.modifications[name] = [];
        }
        module.modifications[name].push(statement);
      }
      if (node.type === "AssignmentExpression") {
        addNode(node.left);
      } else if (node.type === "UpdateExpression") {
        addNode(node.argument);
      }
    }

    walk(statement, {
      enter(node) {
        //收集本节点上使用的变量
        checkForReads(node);
        checkForWrites(node);
        let newScope;
        switch (node.type) {
          case "FunctionDeclaration":
            addToScope(node.id.name); //say
            const names = node.params.map((param) => param.name);
            newScope = new Scope({
              name: node.id.name,
              parent: currentScope,
              names,
            });
            break;
          case "VariableDeclaration":
            node.declarations.forEach((declaration) => {
              addToScope(declaration.id.name); //var
            });
            break;
          default:
            break;
        }
        // _scope 标识，离开节点时候会用得上
        if (newScope) {
          Object.defineProperty(node, "_scope", { value: newScope });
          currentScope = newScope;
        }
      },
      leave(node) {
        if (hasOwnProperty(node, "_scope")) {
          currentScope = currentScope.parent;
        }
      },
    });
  });
}

module.exports = analyse;
