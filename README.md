# hippy 支持动态import插件

对于⼤的 Hippy 应用来讲，将所有的代码都放在⼀个文件中显然是不够有效的，特别是当你的某些代码块是在某些特殊的时候才会被使用到。

配合 react-router 使用 import() 异步按需加载组件，减少不必要的资源加载，提高首屏性能。

webpack 支持将你的代码库分割成 chunks(语块)，当代码运行到需要它们的时候再进行加载。通过脚本懒加载，使得初始下载的代码更⼩

由于hippy 不支持 动态创建script ，需要改写 __webpack_require__.e， 通过修改 compilation.mainTemplate.hooks.requireEnsure 来改写 __webpack_require__.e;
