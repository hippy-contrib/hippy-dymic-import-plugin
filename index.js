"use strict";
const Template = require("webpack/lib/Template");
class HippyJsonpTemplatePlugin {
	apply(compiler) {
		compiler.hooks.make.tapAsync("HippyJsonpTemplatePlugin", (compilation, callback) => {
			const tapsOfRequireEnsuer = compilation.mainTemplate.hooks.requireEnsure.taps;
			console.log("=====HippyJsonpTemplatePlugin======",{tapsOfRequireEnsuer})
			for (let i = 0; i < tapsOfRequireEnsuer.length; i++) {
			  if (tapsOfRequireEnsuer[i].name === "JsonpMainTemplatePlugin load") {
				tapsOfRequireEnsuer.splice(i, 1);
				compilation.mainTemplate.hooks.requireEnsure.tap(
				   "JsonpMainTemplatePlugin load",
				   (source, chunk, hash) => {
						const chunkLoadTimeout = compilation.mainTemplate.outputOptions.chunkLoadTimeout;
						return Template.asString([
							source,
							"",
							"// JSONP chunk loading for javascript",
							"",
							"var installedChunkData = installedChunks[chunkId];",

							'if(installedChunkData !== 0) { // 0 means "already installed".',
							Template.indent([
								"",
								'// a Promise means "currently loading".',
								"if(installedChunkData) {",
								Template.indent(["promises.push(installedChunkData[2]);"]),
								"} else {",
								Template.indent([
									"// setup Promise in chunk cache",
									"var promise = new Promise(function(resolve, reject) {",
									Template.indent([
										"installedChunkData = installedChunks[chunkId] = [resolve, reject];"
									]),
									"});",
									"promises.push(installedChunkData[2] = promise);",
									"",
									"// start chunk loading",
									"var script = {}",
									"var onScriptComplete;",
									"function runCode(code) { (0, eval)('this').eval(code); }",
									`script.timeout = ${chunkLoadTimeout / 1000};`,
									"script.src = jsonpScriptSrc(chunkId);",
									"fetch(script.src).then(res => {",
										Template.indent([	
											"runCode(res.body);",
											"script.onload();"
										]),
									"}).catch(err => {",
										Template.indent([	
											"script.onerror({ type: 'missing', src: err.userInfo && err.userInfo.NSErrorFailingURLStringKey })",
										]),
									"})",
									"// create error before stack unwound to get useful stacktrace later",
									"var error = new Error();",
									"onScriptComplete = function (event) {",
									Template.indent([
										"// avoid mem leaks in IE.",
										"script.onerror = script.onload = null;",
										"clearTimeout(timeout);",
										"var chunk = installedChunks[chunkId];",
										"if(chunk !== 0) {",
										Template.indent([
											"if(chunk) {",
											Template.indent([
												"var errorType = event && (event.type === 'load' ? 'missing' : event.type);",
												"var realSrc = event.src",
												"error.message = 'Loading chunk ' + chunkId + ' failed.\\n(' + errorType + ': ' + realSrc + ')';",
												"error.name = 'ChunkLoadError';",
												"error.type = errorType;",
												"error.request = realSrc;",
												"chunk[1](error);"
											]),
											"}",
											"installedChunks[chunkId] = undefined;"
										]),
										"}"
									]),
									"};",
									"var timeout = setTimeout(function(){",
										Template.indent([
											"onScriptComplete({ type: 'timeout', target: script });"
										]),
									`}, ${chunkLoadTimeout});`,
									"script.onerror = script.onload = onScriptComplete;"
									// compilation.mainTemplate.hooks.jsonpScript.call("", chunk, hash),
									// "document.head.appendChild(script);"
								]),
								"}"
							]),
							"}"
						]);
					}
				);
				break;
			  }
			}
			callback(null, compilation);
		});
	}
}

module.exports = HippyJsonpTemplatePlugin;
