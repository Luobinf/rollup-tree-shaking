const MagicString = require("magic-string");
const { parse } = require("acorn");
let analyse = require("./analyse");
const { hasOwnProperty } = require("./utils");
const SYSTEMS = ['console', 'log'];

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
    //存放本模块定义变量的语句 { name: var name = 'jack'}
    this.definitions = {};
    // 存放本模块变量修改的语句：例如 a+= 90; a++
    this.modifications = {};
    // 存放冲突的变量
    this.canonicalNames = {}

    this.definitionPromises = {}
    analyse(this.ast, this.code, this); // 分析 AST，做一些相关操作，例如获取本模块的导入信息、导出信息、定义变量的语句等
  }

  rename(name, replacement) {
    this.canonicalNames[name] = replacement;
  }

  getCanonicalName(name) {
    return this.canonicalNames[name] || name;
  }

  expandAllStatements() {
    let allStatements = [];

    this.ast.body.forEach((statement) => {

      if (statement._included) return;
      // 导入的语句全部过滤掉，以免后续生成代码的时候会将import xx from xx的代码带到最终的产物中去。
      //import 的变量只有在后面的代码中用到了才会导入进来，否则无需引入。
      if (statement.type === "ImportDeclaration") {
        return;
      }
      //默认不包含所有的变量声明语句
      if (statement.type === "VariableDeclaration") return;

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
      //找到此变量定义的语句，添加到输出数组里。🀄️🀄️🀄️🀄️🀄️🀄️🀄️🀄️🀄️🀄️🀄️🀄️🀄️🀄️
      let definitions = this.define(name);
      result.push(...definitions);
    });
    result.push(statement);
    // 找到变量修改的语句。

    // export const a = 90; a += 88
    const defines = Object.keys(statement._defines);
    defines.forEach((name) => {
      //找到定义的变量依赖的修改的语句
      const modifications =
        hasOwnProperty(this.modifications, name) && this.modifications[name];
      if (modifications) {
        //把修改语句也展开放到结果里
        modifications.forEach((statement) => {
          if (!statement._included) {
            let statements = this.expandStatement(statement);
            result.push(...statements);
          }
        });
      }
    });

    return result;
  }

  define(name) {

    if (hasOwnProperty(this.definitionPromises, name)) {
      return [];
    }

    // 先判断此变量是通过 import 外部导入的，还是模块内声明的
    let result;

    if (hasOwnProperty(this.imports, name)) {
      //说明此变量不是模块内声明的，而是外部导入的,获取从哪个模块内导入了哪个变量
      const { source, importName } = this.imports[name];
      //获取这个模块
      const importModule = this.bundle.fetchModule(source, this.path);
      //从这个模块的导出变量获得本地变量的名称
      const { localName, exportedName } = importModule.exports[importName];
      //获取本地变量的定义语句
      result = importModule.define(localName); //name 
    } else {
      // 如果是当前模块内的变量
      let statement = this.definitions[name]; //name
      if (statement) {
        if (statement._included) {
          result = [];
        } else {
          result = this.expandStatement(statement);
        }
      } else {
        if (SYSTEMS.includes(name)) {
          result = [];
        } else {
          //   //如果找不到定义的变量就报错
          //   throw new Error(
          //     `变量${name}既没有从外部导入，也没有在当前的模块声明`
          //   );
          result = [];
        }
      }
    }
    // 存放已经通过变量获取过的定义语句，以免下次再获取该变量时，该变量的定义部分引入多次。
    this.definitionPromises[name] = result || [];
    return this.definitionPromises[name];
  }
}

module.exports = Module;
