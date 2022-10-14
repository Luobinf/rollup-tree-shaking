# tree-shaking

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