

对于⼤的 Hippy 应用来讲，将所有的代码都放在⼀个文件中显然是不够有效的，特别是当你的某些代码块是在某些特殊的时候才会被使用到。

配合 react-router 使用 import() 异步按需加载组件，减少不必要的资源加载，提高首屏性能。

webpack 支持将你的代码库分割成 chunks(语块)，当代码运行到需要它们的时候再进行加载。通过脚本懒加载，使得初始下载的代码更⼩


由于hippy 不支持 动态创建script ，需要改写 __webpack_require__.e， 通过修改 compilation.mainTemplate.hooks.requireEnsure 来改写 __webpack_require__.e;



webpack 支持懒加载 JS 脚本的⽅式:
[webbpack文档](https://webpack.docschina.org/guides/code-splitting/#%E5%8A%A8%E6%80%81%E5%AF%BC%E5%85%A5dynamic-import)

1. CommonJS:require.ensure
2. ES6:动态 import(目前还没有原生⽀持，需要 babel 转换)



### import()  -->  __webpack_require__.e



首先看一下 import() 被转换后的代码

源代码：
```javascript
const NearbyPage = Loadable({
  loader: () => {
    common.hotClick("kg.dynamicImport.loadNearbyPage");
    console.info("[dynamic] load NearbyPage");
    return import(/* webpackChunkName:"NearbyPage" */ "./pages/NearbyPage")
  },
  loading: () => null
});
```


转化后代码：
```javascript
const NearbyPage = react_loadable__WEBPACK_IMPORTED_MODULE_0___default()({
  loader: () => {
    common__WEBPACK_IMPORTED_MODULE_8__["default"].hotClick("kg.dynamicImport.loadNearbyPage");
    console.info("[dynamic] load NearbyPage");
    return __webpack_require__.e(/*! import() | NearbyPage */ 0).then(__webpack_require__.bind(null, /*! ./pages/NearbyPage */ "oCDp"));
  },
  loading: () => null
});
```

文件路径被替换成了 chunkId，作为参数调用了__webpack_require__.e，重点研究下 __webpack_require__.e 的实现

1. 判断 installedChunks[chunkId] 是否已经被加载，如果已经被加载，直接返回 Promise.all([])

2. 判断 installedChunks[chunkId] 是否在加载中，如果在加载中，把表示加载中的 promise 添加到 promises 数组中

3. 没有加载的话，创建 promise，并赋值：installedChunks[chunkId] = [resolve, reject]，添加到promises 数组中

4. 动态创建 script 标签，添加 onerror 以及 onload 事件，并进行加载超时的处理

```javascript
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var promises = [];
/******/
/******/
/******/ 		// JSONP chunk loading for javascript
/******/
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 			// a Promise means "currently loading".
/******/ 			if(installedChunkData) {
/******/ 				promises.push(installedChunkData[2]);
/******/ 			} else {
/******/ 				// setup Promise in chunk cache
/******/ 				var promise = new Promise(function(resolve, reject) {
/******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 				});
/******/ 				promises.push(installedChunkData[2] = promise);
/******/
/******/ 				// start chunk loading
/******/ 				var script = document.createElement('script');
/******/ 				var onScriptComplete;
/******/
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 3;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.src = jsonpScriptSrc(chunkId);
/******/
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				onScriptComplete = function (event) {
/******/ 					// avoid mem leaks in IE.
/******/ 					script.onerror = script.onload = null;
/******/ 					clearTimeout(timeout);
/******/ 					var chunk = installedChunks[chunkId];
/******/ 					if(chunk !== 0) {
/******/ 						if(chunk) {
/******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 							var realSrc = event && event.target && event.target.src;
/******/ 							error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 							error.name = 'ChunkLoadError';
/******/ 							error.type = errorType;
/******/ 							error.request = realSrc;
/******/ 							chunk[1](error);
/******/ 						}
/******/ 						installedChunks[chunkId] = undefined;
/******/ 					}
/******/ 				};
/******/ 				var timeout = setTimeout(function(){
/******/ 					onScriptComplete({ type: 'timeout', target: script });
/******/ 				}, 3000);
/******/ 				script.onerror = script.onload = onScriptComplete;
/******/ 				document.head.appendChild(script);
/******/ 			}
/******/ 		}
/******/
/******/ 		// JSONP chunk loading for javascript
/******/
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 			// a Promise means "currently loading".
/******/ 			if(installedChunkData) {
/******/ 				promises.push(installedChunkData[2]);
/******/ 			} else {
/******/ 				// setup Promise in chunk cache
/******/ 				var promise = new Promise(function(resolve, reject) {
/******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 				});
/******/ 				promises.push(installedChunkData[2] = promise);
/******/
/******/ 				// start chunk loading
/******/ 				var script = {}
/******/ 				var onScriptComplete;
/******/ 				function runCode(code) { (0, eval)('this').eval(code); }
/******/ 				script.timeout = 3;
/******/ 				script.src = jsonpScriptSrc(chunkId);
/******/ 				fetch(script.src).then(res => {
/******/ 					runCode(res.body);
/******/ 					script.onload();
/******/ 				}
/******/ 				).catch(err => {
/******/ 					script.onerror()
/******/ 				}
/******/ 				);
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				onScriptComplete = function (event) {
/******/ 					// avoid mem leaks in IE.
/******/ 					script.onerror = script.onload = null;
/******/ 					clearTimeout(timeout);
/******/ 					var chunk = installedChunks[chunkId];
/******/ 					if(chunk !== 0) {
/******/ 						if(chunk) {
/******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 							var realSrc = event && event.target && event.target.src;
/******/ 							error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 							error.name = 'ChunkLoadError';
/******/ 							error.type = errorType;
/******/ 							error.request = realSrc;
/******/ 							chunk[1](error);
/******/ 						}
/******/ 						installedChunks[chunkId] = undefined;
/******/ 					}
/******/ 				};
/******/ 				var timeout = setTimeout(function(){
/******/ 					onScriptComplete({ type: 'timeout', target: script });
/******/ 				}, 3000);
/******/ 				script.onerror = script.onload = onScriptComplete;
/******/ 			}
/******/ 		}
/******/ 		return Promise.all(promises);
/******/ 	};
```

由于hippy不支持script 标签，需要将动态创建script替换；

