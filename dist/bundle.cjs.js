'use strict';

let name = 'jack';
name += 99;

name;


// import { name, age } from './msg';

// // 此节点定义了哪些变量，使用了哪些变量，此节点所属于的模块，此节点的源代码是啥
// const title = 90 + name;  

// function say() {
//   const a = 90
//   console.log('hello', a, name);
// }

// say();
// console.log(title)

// import { age1 } from './age1.js';
// import { age2 } from './age2.js';
// import { age3 } from './age3.js';
// console.log(age1, age2, age3);

// const age = '年龄';
// const age1 = age + '1';

// const age = '年龄';
// const age2 = age + '2';

// const age = '年龄';
// const age3 = age + '3';



// const age$2 = '年龄';
// const age1 = age$2 + '1';

// const age$1 = '年龄';
// const age2 = age$1 + '2';

// const age = '年龄';
// const age3 = age + '3';

// console.log(age1, age2, age3);


// import { name, age } from './msg';

// var title = 90 + name;

// function say() {
//   console.log('hello', name);
// }

// say();
// console.log(title)

// var name = 'xxx';
// if (false) {
//   var age = 12;
// }
// console.log(age);

// const module1 = {
//   definedNames: ['say', 'title'],
//   definitions: {
//     say: 'statement',
//     title: 'statement',
//   },
//   ast: {
//     body: [
//       {
//         type: 'ImportDeclaration',
//         _defines: {},
//         _dependsOn: {}
//       }, 
//       {
//         type: 'FunctionDeclaration',
//         _defines: {
//           say: true
//         },
//         _dependsOn: {
//           console: true,
//           name: true
//         }
//       },
//       {
//         type: 'VariableDeclaration',
//         _defines: {
//           title: true
//         },
//         _dependsOn: {
         
//         }
//       },
//       {
//         type: 'ExpressionStatement',
//         _defines: {
          
//         },
//         _dependsOn: {
//           console: true,
//           name: true
//         }
//       },
//       {
//         type: 'ExpressionStatement',
//         _defines: {
          
//         },
//         _dependsOn: {
//           say: true
//         }
//       }
//     ]
//   },
//   code: ''
// }
