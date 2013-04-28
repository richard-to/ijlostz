var window = {};

importScripts('vendor/underscore.js');
importScripts('lib/ijlostz.js');
importScripts('lib/ijlostz.ga.js');

var TetrisGA = window.TetrisGA;
self.addEventListener('message', function(e) {
    var data = e.data.data;
    var postMessage = self.postMessage;
    TetrisGA.simulateFitness(data.genotype, data.shapes, 150, function(genotype) {
        postMessage({id: e.data.id, data: genotype});
    });
}, false);