//@author rakesh
var ImportedFunctions = (function() {
    var module;
    return {
        setModule: function(mod) { module = mod; },

        LogFromJS: function(arg) {
            console.log(arg) 
        },

        Draw: function(point, rect) {
            var x = module.getValue(point, 'i32', true);
            var y = module.getValue(point + 4, 'i32', true);
            console.log("x: " + x + ", y: " + y);
            var pointArray = new Int32Array(module.HEAP32.buffer, point, 2);
            console.log("x: " + pointArray[0] + ", y: " + pointArray[1]);
            var rectArray = new Int32Array(module.HEAP32.buffer, rect, 4);
            console.log("rect is " + rectArray)
            return true;
        }
    }
})();


var WebAssemblyLoader = (function(){ 
    var wasmFileName = "example.wasm";
    var module;
    var savedWebModule, savedWebInstance;
    var environmentIsWeb = typeof window === 'object';
    var environmenIsNode = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
    var readFile = function(filename, binary) {
        binary = binary || true;
        return new Promise(function(resolve, reject) {
            const path = require('path')
            const fs = require('fs')
            filename = path.normalize(__dirname + "/" + filename);
            fs.readFile(filename, binary ? null : 'utf8', function(error, data) {
                if(error) return reject(error)
                else return resolve(data)
            });
        });
    };
    var readWeb = function(filename) {
        return new Promise(function(resolve, reject) {
            fetch(filename)
            .then(function(response) { response.arrayBuffer().then(function(arrayBuffer) { resolve(arrayBuffer); }); })
            .catch(function(error) { reject(error); });
        });
    };
    return {
        setModule: function(mod) { module = mod; },
        setWasmFile: function(fileName) { wasmFileName = fileName; },

        instantiateWasm: function(info, successCallback) {
            console.log('instantiateWasm: instantiating asynchronously');
            for(var prop in ImportedFunctions) {
                if(typeof ImportedFunctions[prop] == "function" && prop !== "setModule") {
                    info.env[prop] = ImportedFunctions[prop];
                }
            }
            var compileAndInstantiateWasm = function(binary) {
                WebAssembly.compile(binary)
                .then(function(module) { 
                    savedWebModule = module;
                    return WebAssembly.instantiate(module, info)
                })
                .then(function(instance) {
                    savedWebInstance = instance;
                    successCallback(instance);
                })
                .catch(function(e) {
                    console.error('wasm instantiation failed! ' + e);
                });
            };
            if(typeof WebAssembly.compile == 'undefined' && module && module.doWasm2JS) {
                try {
                    // var instance = new WebAssembly.Instance(info.env, info.env.memory, info.env.table);
                    var wasm2jsInstantiate = module['__wasm2jsInstantiate__'];
                    var exports = wasm2jsInstantiate(info.env, info.env.memory, info.env.table);
                    var instance = {exports: exports};
                    successCallback(instance);
                }
                catch(e) {
                    console.log("exception stack: " + e.stack);
                }
            } else {
                var fetchCommon = environmenIsNode ? readFile : readWeb;
                fetchCommon(wasmFileName)
                .then(function(arrayBuffer) { compileAndInstantiateWasm(arrayBuffer); })
                .catch(function(e) {console.log(e.message);})
            }
            return {}; // Compiling asynchronously, no exports.
        }
    }
})();


if (typeof exports === 'object' && typeof module === 'object')
  module.exports = {
    ImportedFunctions: ImportedFunctions,
    WebAssemblyLoader:  WebAssemblyLoader
  };