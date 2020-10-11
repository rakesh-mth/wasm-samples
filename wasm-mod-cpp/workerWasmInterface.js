if (typeof importScripts != 'undefined') {
    self.importScripts('loader.js')
    self.importScripts('out/example.js')

    var module = { instantiateWasm: WebAssemblyLoader.instantiateWasm };
    WebAssemblyLoader.setWasmFile("out/example.wasm");
    ImportedFunctions.setModule(module);
    Module(module).then(function(instance) {
        var data = instance.returnVectorData();
        postMessage(data);
        var regions = {enabled: true, flags: 10, rects: [
            { left: 10, right: 20, top: 0, bottom: 20},
            { left: 30, right: 40, top: 10, bottom: 100} 
        ]}
        var regionsNew = instance.TransformRegions(regions);
        postMessage(regionsNew);
    });

    onmessage = function(e) {
        console.log('Message received from main script');
        console.log('Posting message back to main script');
        var workerResult = 'From worker: Result: ' + e.data.test;
        postMessage(workerResult);
    }
}