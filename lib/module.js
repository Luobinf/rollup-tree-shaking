const MagicString = require("magic-string");
const { parse } = require("acorn");
let analyse = require("./analyse");
const { hasOwnProperty } = require("./utils");

class Module {
  constructor({ code, path, bundle }) {
    this.code = new MagicString(code, { filename: path }); // 将字符串代码生成 sourceMap。
    this.path = path;
    this.bundle = bundle;
    this.ast = parse(code, {
      ecmaVersion: 2022,
      sourceType: "module",
    });
    //存放本模块的导入信息
    this.imports = {};
    //存放本模块的导出信息
    this.exports = {};
    //存放本模块定义变量的语句 a=>var a = 1;b =var b =2;
    this.definitions = {};
    analyse(this.ast, this.code, this); // 分析 AST，做一些相关操作，例如获取本模块的导入信息、导出信息、定义变量的语句等
  }
  expandAllStatements() {
    let allStatements = [];
    this.ast.body.forEach((statement) => {
      // 导入的语句全部过滤掉，以免后续生成代码的时候会将import xx from xx的代码带到最终的产物中去。
      if (statement.type === "ImportDeclaration") {
        return;
      }
      let statements = this.expandStatement(statement);
      allStatements.push(...statements);
    });
    return allStatements;
  }
  expandStatement(statement) {
    statement._included = true;
    let result = [];
    //获取此语句依赖的变量
    let _dependsOn = Object.keys(statement._dependsOn);
    _dependsOn.forEach((name) => {
      //找到此变量定义的语句，添加到输出数组里
      let definitions = this.define(name);
      result.push(...definitions);
    });
    result.push(statement);
    return result;
  }
  define(name) {
    //先判断此变量是外部导入的还是模块内声明的
    if (hasOwnProperty(this.imports, name)) {
      //说明此变量不是模块内声明的，而是外部导入的,获取从哪个模块内导入了哪个变量
      const { source, importName } = this.imports[name];
      //获取这个模块
      const importModule = this.bundle.fetchModule(source, this.path);
      //从这个模块的导出变量获得本地变量的名称
      const { localName, exportedName } = importModule.exports[importName];
      //获取本地变量的定义语句
      return importModule.define(localName); //name
    } else {
      //如果是模块的变量的话
      let statement = this.definitions[name]; //name
      if (statement && !statement._included) {
        //如果本地变量的话还需要继续展开
        return this.expandStatement(statement);
      } else {
        return [];
      }
    }
  }
}

module.exports = Module;