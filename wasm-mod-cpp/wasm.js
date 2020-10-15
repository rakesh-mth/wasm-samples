
var module = { instantiateWasm: WebAssemblyLoader.instantiateWasm };
WebAssemblyLoader.setWasmFile("out/example.wasm");
ImportedFunctions.setModule(module);
Module(module).then(function(instance) {
    var myClassObj = new instance.MyClass(10, "hello");
    myClassObj.incrementX();
    console.log(myClassObj.x);
});