class Scope {
  constructor(options = {}) {
    // 当前作用域名字
    this.name = options.name || null;
    // 当前作用域的父作用域
    this.parent = options.parent || null;
    // 当前作用域内存放的所有变量定义
    this.names = options.names || [];
    this.isBlock = !!options.isBlock
  }
  // 增加变量到变量定义的数组中去
  add(name, isBlockDeclaration) {
    if(this.isBlock && !isBlockDeclaration) {
      // 这是一个var或者函数声明，并且这是一个块级作用域，所以我们需要变量提升
      this.parent.add(name, isBlockDeclaration); 
    } else {
      this.names.push(name);
    }
  }
  // 寻找变量所在的作用域
  findNameDefinitedScope(name) {
    if (this.names.includes(name)) {
      return this;
    } else if (this.parent) {
      return this.parent.findNameDefinitedScope(name);
    } else {
      return null;
    }
  }
}

// var a = 1;
// function one() {
//   var b = 1;
//   function two() {
//     var c = 2;
//     console.log(a, b, c);
//   }
// }
// let Scope = require('./scope');
// let globalScope = new Scope({ name: "global", names: ["a"], parent: null });
// let oneScope = new Scope({ name: "one", names: ["b"], parent: globalScope });
// let twoScope = new Scope({ name: "two", names: ["c"], parent: oneScope });
// console.log(
//   twoScope.findNameDefinitedScope("a").name,
//   twoScope.findNameDefinitedScope("b").name,
//   twoScope.findNameDefinitedScope("c").name
// );

module.exports = Scope
