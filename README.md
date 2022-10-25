# tree-shaking

Tree-Shaking 是一种基于 ES Module 规范的 Dead Code Elimination 技术，它会在运行过程中静态分析模块之间的导入导出，确定 ESM 模块中哪些导出值未曾其它模块使用，并将其删除，以此实现打包产物的优化。
Tree Shaking 较早前由 Rich Harris 在 Rollup 中率先实现，Webpack 自 2.0 版本开始接入，至今已经成为一种应用广泛的性能优化手段。

**理论基础**

在 CommonJs、AMD、CMD 等旧版本的 JavaScript 模块化方案中，导入导出行为是高度动态，难以预测的，例如：

```JS
if(process.env.NODE_ENV === 'development'){
  require('./bar');
  exports.foo = 'foo';
}
```

而 ESM 方案则从规范层面规避这一行为，它要求所有的导入导出语句只能出现在模块顶层，且导入导出的模块名必须为字符串常量，这意味着下述代码在 ESM 方案下是非法的：

```JS
if(process.env.NODE_ENV === 'development'){
  import bar from 'bar';
  export const foo = 'foo';
}
```

所以，ESM 下模块之间的依赖关系是高度确定的，与运行状态无关，编译工具只需要对 ESM 模块做静态分析，就可以从代码字面量中推断出哪些模块值未曾被其它模块使用，这是实现 Tree Shaking 技术的必要条件。



## Rollup

rollup 默认只支持编译 ES6 模块（import/export）。如需要支持 CommonJS 的模块解析，需要引入 @rollup/plugin-commonjs 插件（A Rollup plugin to convert CommonJS modules to ES6, so they can be included in a Rollup bundle）。


rollup 默认不查找第三方node_modules中的模块，需要通过插件 @rollup/plugin-node-resolve 来支持。



/* PURE */  纯函数， 告诉打包工具该函数没有副作用，若没有调用的话可以进行删除。



## magic-string

这是一个用来对字符串进行操作，并可以生成 sourceMap 的工具库。

```JS
const MagicString = require('magic-string');
let sourceCode = `const name = 'jack'`;
let s = new MagicString(sourceCode);

// console.log(s.toString())

// s.indent('xx')

// console.log(s.toString())


const map = s.generateMap({
    source: 'source.js',
    file: 'converted.js.map',
    includeContent: true
  });

// console.log(map.toString())


// 连接多个 source ，可以使用 MagicString.Bundle


const bundle = new MagicString.Bundle();

bundle.addSource({
  filename: 'foo.js',
  content: new MagicString('var answer = 42;')
});

bundle.addSource({
  filename: 'bar.js',
  content: new MagicString('console.log( answer )')
});

bundle// optionally, pass an indent string, otherwise it will be guessed
  .prepend('(function () {\n')
  .append('}());');


// console.log( bundle.prepend('xxx')  )

console.log( bundle.toString()  )
```


https://tehub.com/a/9YRKZFbzrE


### 删除没有用到的变量，要哪个用哪个，按需索取。


### tree-shaking

1. 完成最基本的 tree-shaking。
2. 支持块级作用域。
3. 变量冲突重命名（冲突了的分成一组并修改变量名字）

## 步骤

1. 在module里收集imports、exports和definitions
2. 

rollup 变量名冲突是怎么解决的？

首先找出相互冲突的变量，随后，从后往上进行重命名（最后一个冲突的不作改动），依次在变量的后面添加 $1、$2 等。


import { age, name } from './msg.js'

function say() {
  const name = 9;
  console.log('hello', name);
}

say();


1. 首先对入口模块生成 AST
2. 分析 AST，找出模块所有的定义definitions（var、const、let、function）、imports、exports
3. 根据 AST，对每一条 statement 进行分析，找出每一条语句所定义的变量与使用到的变量（_defines、_dependsOn），并生成对应的作用域。
4. expandAllStatements，整理对应的 statement，某些 statement 需要直接删除掉（如 import 声明、变量声明），找出 statement 所依赖的变量语句，找出来放入到 result 中去，当前自身语句也需要存到 result 中去。最后返回该 result。
5. 根据 result 中的数据 generate 最终的代码。


```JS
function say() {
  const name = 9;
  console.log('hello', name);
}
```

对上述代码进行分析，该语句依赖的变量为空，定义的变量为say。因为 name 属性可以在 say 函数的作用域中找到，故不需要依赖外部的 name 变量。



