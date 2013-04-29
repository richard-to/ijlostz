(function() {

        }
    };

    var CANVAS_ID = "player-board";

    var canvas = document.getElementById(CANVAS_ID);
    var canvas2 = document.getElementById("cpu-board");

    //var randomGen = new Tetris.RandomGenerator(Tetris.ShapeList);
    //var shapes = TetrisGA.initializeShapes(30, randomGen);
    var shapes = [];
    _(20).times(function(n){ shapes.push(Tetris.ShapeO)});

    var genotypes = TetrisGA.initializeGenePool(100, shapes.length);

    var tetris = new Tetris.Game(
        new Tetris.CanvasView(canvas),
        new TetrisGA.MockGenerator(shapes.slice()),
        {
            onGameEnd: onGameEnd,
            onScoreUpdated: onScoreUpdated
        });
    tetris.run();

    var tetris2 = null;
    function onScoreUpdated2(score) {
        $(".cpu-game-container .score").text(score);
        if (score > parseInt($(".cpu-game-container .best-score").text())) {
             $(".cpu-game-container .best-score").text(score);
        }
    }

    function onGameEnd2(score) {
        tetris2 = null;
    }

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
            new TetrisGA.MockGenerator(shapes.slice()),
            {
                onGameEnd: onGameEnd,
                onScoreUpdated: onScoreUpdated
            });
        tetris.run();
    }

    var workerPool = new WorkerPool("static/js/worker.js", 8);
    for (var i = 0; i < genotypes.length; i++) {
        workerPool.runJob({genotype: genotypes[i], shapes: shapes}, onJobCompleted);
    }
    var returned = 0;
    var currentGeneration = 0;
    var bestScore = 0;
    var bestGenotype = null;
    var sumScores = 0;
    function onJobCompleted(genotype) {
        returned++;

        sumScores += genotype.fitness;
        if (genotype.fitness >= bestScore) {
            bestScore = genotype.fitness;
            bestGenotype = TetrisGA.cloneGenotype(genotype);
        }

        if (returned === genotypes.length) {

            if (tetris2 == null) {
                $(".cpu-game-container .score").text(0);

                var moves2 = TetrisGA.convertGenotypeToMoves(bestGenotype, shapes);
                var shapeBag2 = new TetrisGA.MockGenerator(shapes.slice());

                tetris2 = new Tetris.Game(
                    new Tetris.CanvasView(canvas2),
                    shapeBag2,
                    {
                        keysEnabled: false,
                        onGameEnd: onGameEnd2,
                        onScoreUpdated: onScoreUpdated2
                    });
                var player = new TetrisGA.ComputerPlayer(tetris2, moves2, null)
                player.play();
            }

            var avgScore = sumScores / 100;
            var li = $("<li>");
            li.text(bestScore + " (" + avgScore.toFixed(2) + ")");
            $(".results-list").append(li);
            returned = 0;
            bestScore = 0;
            sumScores = 0;
            currentGeneration++;
            if (currentGeneration < 125) {
                var parents = TetrisGA.tournamentSelection(genotypes);
                var children = TetrisGA.uniformCrossover(parents, .93);
                var mutations = TetrisGA.mutationRandomReset(children, 0.07);
                genotypes = mutations;
                for (var i = 0; i < genotypes.length; i++) {
                    workerPool.runJob({genotype: genotypes[i], shapes: shapes}, onJobCompleted);

                }
            } else {
                workerPool.terminateAll();
            }
        }
    }
})();