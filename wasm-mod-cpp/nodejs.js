const nodeFS = require('fs')
const nodePath = require('path')
const loader = require('./loader.js')
const example = require('./out/example.js');

var module = { instantiateWasm: loader.WebAssemblyLoader.instantiateWasm };
loader.WebAssemblyLoader.setWasmFile('out/example.wasm');
loader.ImportedFunctions.setModule(module);

function testArrayMul(instance) {
    var arraySize = 10;
    var bufOffset = instance._malloc(arraySize*4);
    var bufView = new Int32Array(instance.HEAP32.buffer, bufOffset, arraySize);
    for(var i = 0; i < 10; i++) {
        bufView[i] = i * 2 + 1;
    }
    console.log(instance.ArrayMul(bufOffset, arraySize, 5));
    for(var i = 0; i < 10; i++) {
        console.log(bufView[i]);
    }
    instance._free(bufOffset);
}

function testVectorData(instance) {
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
}

function testMapData(instance) {
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
}

function testString(instance) {
    // call c++ function
    let exclaimRes = instance.exclaim("hello exclaim");
    console.log(exclaimRes);
}

function testArrayInStruct(instance) {
    var regions = {enabled: true, flags: 10, rects: [
        { left: 10, right: 20, top: 0, bottom: 20},
        { left: 30, right: 40, top: 10, bottom: 100} 
    ]}
    var regionsNew = instance.TransformRegions(regions);
    console.log(regionsNew);
}

example(module).then((instance) => {
    testArrayMul(instance);
    testVectorData(instance);
    testMapData(instance);
    testString(instance);
    testArrayInStruct(instance);
});