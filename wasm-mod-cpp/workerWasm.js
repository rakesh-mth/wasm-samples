var worker = new Worker('workerWasmInterface.js');

worker.postMessage({ type: 'message', test: 'to worker'});

worker.onmessage = function(e) {
    console.log('Message received from worker');
    console.log(e.data);
}