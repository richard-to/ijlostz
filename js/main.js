(function() {

    var WorkerPool = function(script, numWorkers) {
        var event = "message";
        var numWorkers = numWorkers;
        var tasks = [];
        var pool = [];
        var pending = {};
        var workers = {};

        var runJob = function(data, callback) {
            if (pool.length > 0) {
                var workerMeta = pool.shift();
                var id = workerMeta.id;
                var worker = workerMeta.worker;
                worker.postMessage({id: id, data: data});
                pending[id] = callback;
            } else {
                tasks.push({data: data, callback: callback});
            }
        };
        this.runJob = runJob;

        for (var i = 0; i < numWorkers; i++) {
            var worker = new Worker(script);
            worker.addEventListener(event, function(msg) {
                var id = msg.data.id;
                var data = msg.data.data;
                var callback = pending[id];

                pending[id] = null;
                delete pending[id];

                pool.push({id: id, worker: workers[id]});

                if (tasks.length > 0) {
                    var task = tasks.shift();
                    runJob(task.data, task.callback);
                }

                callback(data);
            }, false);
            workers[i] = worker;
            pool.push({id: i, worker: worker});
        }

        this.terminateAll = function() {
            for (id in workers) {
                workers[id].terminate();
                delete workers[id];
            }
        }
    };

    var CANVAS_ID = "player-board";

    var canvas = document.getElementById(CANVAS_ID);

    var randomGen = new Tetris.RandomGenerator(Tetris.ShapeList);
    var shapes = TetrisGA.initializeShapes(10, randomGen);
    var genotypes = TetrisGA.initializeGenePool(50, shapes.length);

    var tetris = new Tetris.Game(
        new Tetris.CanvasView(canvas),
        new TetrisGA.MockGenerator(_.clone(shapes)),
        {
            onGameEnd: onGameEnd,
            onScoreUpdated: onScoreUpdated
        });
    tetris.run();

    function onScoreUpdated(score) {
        $(".player-game-container .score").text(score);
        if (score > parseInt($(".player-game-container .best-score").text())) {
             $(".player-game-container .best-score").text(score);
        }
    }

    function onGameEnd(score) {
        $(".player-game-container .score").text(0);
        tetris = new Tetris.Game(
            new Tetris.CanvasView(canvas),
            new TetrisGA.MockGenerator(_.clone(shapes)),
            {onGameEnd: onGameEnd});
        tetris.run();
    }
/*
    var workerPool = new WorkerPool("static/js/worker.js", 16);
    for (var i = 0; i < genotypes.length; i++) {
        workerPool.runJob({genotype: genotypes[i], shapes: shapes}, onJobCompleted);
    }
    var returned = 0;
    var currentGeneration = 0;
    function onJobCompleted(genotype) {
        returned++;
        console.log(genotype.fitness);
        if (returned === genotypes.length) {
            returned = 0;
            currentGeneration++;
            console.log("Generation: " + currentGeneration);
            if (currentGeneration < 500) {
                var parents = TetrisGA.tournamentSelection(genotypes);
                var children = TetrisGA.crossoverNPoint(parents, 2, .9);
                var mutations = TetrisGA.mutationRandomReset(children, 0.1);
                genotypes = mutations;
                for (var i = 0; i < genotypes.length; i++) {
                    workerPool.runJob({genotype: genotypes[i], shapes: shapes}, onJobCompleted);

                }
            } else {
                workerPool.terminateAll();
            }
        }
    }
*/
})();