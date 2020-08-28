const nodeFS = require('fs')
const nodePath = require('path')
const example = require('./out/nodejs/example.js');

var module;

var logFromJS = function(log) {
    var res = new Uint8Array(module.HEAPU8.subarray(log, log+5));
    var strMsg = String.fromCharCode.apply(null, res);
    console.log(strMsg);
}

var readFile = function(filename, binary) {
    // filename = example.locateFile(filename);
    filename = nodePath['normalize'](`${__dirname}/${filename}`);
    return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
};

module = {
    instantiateWasm: function(info, receiveInstance) {
        var binary = readFile('out/nodejs/example.wasm', true); //fetch('example.wasm') does not work
        info.env.logFromJS = logFromJS;
        var wasmInstantiate = WebAssembly.instantiate(binary, info).then(function(output) {
            console.log('wasm instantiation succeeded');
            receiveInstance(output.instance);
        }).catch(function(e) {
            console.log('wasm instantiation failed! ' + e);
        });
        // retrun {}; // Compiling asynchronously, no exports.
    }
}

example(module).then((instance) => {
    var retVector = instance.returnVectorData();

    // vector size
    var vectorSize = retVector.size();

    // reset vector value
    retVector.set(vectorSize - 1, 11);

    // push value into vector
    retVector.push_back(12);

    // retrieve value from the vector
    for (var i = 0; i < retVector.size(); i++) {
        console.log("Vector Value: ", retVector.get(i));
    }

    // expand vector size
    retVector.resize(20, 1);

    var retMap = instance.returnMapData();

    // map size
    var mapSize = retMap.size();

    // map size 
    console.log("Map Size: ", mapSize);

    // retrieve value from map
    console.log("Map Value: ", retMap.get(10));

    // figure out which map keys are available
    // NB! You must call `register_vector<key_type>`
    // to make vectors available
    var mapKeys = retMap.keys();
    for (var i = 0; i < mapKeys.size(); i++) {
        var key = mapKeys.get(i);
        console.log("Map key/value: ", key, retMap.get(key));
    }

    // reset the value at the given index position
    retMap.set(10, "OtherValue");

    // call c++ function
    let exclaimRes = instance.exclaim("hello exclaim");
    console.log(exclaimRes);
});