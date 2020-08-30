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
            console.log(`x: ${x}, y: ${y}`);
            var pointArray = new Int32Array(module.HEAP32.buffer, point, 2);
            console.log(`x: ${pointArray[0]}, y: ${pointArray[1]} `);
            var rectArray = new Int32Array(module.HEAP32.buffer, rect, 4);
            console.log(`rect is ${rectArray}`)
            return true;
        }
    }
})();


var WebAssemblyLoader = (function(){ 
    var wasmFileName = "example.wasm";
    var savedWebModule, savedWebInstance;
    var environmentIsWeb = typeof window === 'object';
    var environmenIsNode = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
    var readFile = function(filename, binary) {
        // filename = example.locateFile(filename);
        const path = require('path')
        const fs = require('fs')
        filename = path.normalize(`${__dirname}/${filename}`);
        return fs.readFileSync(filename, binary ? null : 'utf8');
    };
    return {

        setWasmFile: function(fileName) { wasmFileName = fileName; },

        instantiateWasm: function(info, successCallback) {
            console.log('instantiateWasm: instantiating asynchronously');
            var compileAndInstantiateWasm = function(binary) {
                WebAssembly.compile(binary)
                .then(function(module) { 
                    savedWebModule = module;
                    for(var prop in ImportedFunctions) {
                        if(typeof ImportedFunctions[prop] == "function" && prop !== "setModule") {
                            info.env[prop] = ImportedFunctions[prop];
                        }
                    }
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
            if(environmenIsNode) { 
                compileAndInstantiateWasm(readFile(wasmFileName, true));
            }
            else if(environmentIsWeb) {
                fetch(wasmFileName).then(
                    response => response.arrayBuffer().then(arrayBuffer => compileAndInstantiateWasm(arrayBuffer))
                );
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