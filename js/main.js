(function() {

    // Global settings for Tetris GA
    var settings = {
        population: 100,
        shapes: 20,
        generations: 125,
        pc: .93,
        pm: .1,
        workers: {
            script: "static/js/worker.js",
            num: 8
        },
        id: {
            playerCanvas: "player-board",
            cpuCanvas: "cpu-board",
        },
        selector: {
            playerScore: ".player-game-container .score",
            playerBest: ".player-game-container .best-score",
            cpuScore: ".cpu-game-container .score",
            cpuBest: ".cpu-game-container .best-score",
            resultList: ".results-list"
        }
    };

    var playerCanvas = document.getElementById(settings.id.playerCanvas);
    var cpuCanvas = document.getElementById(settings.id.cpuCanvas);

    var randomGen = new Tetris.RandomGenerator(Tetris.ShapeList);
    var shapes = TetrisGA.initializeShapes(settings.shapes, randomGen);
    //var shapes = [];
    //_(20).times(function(n){ shapes.push(Tetris.ShapeO)});

    var genotypes = TetrisGA.initializeGenePool(settings.population, shapes.length);

    var playerTetris = new Tetris.Game(
        new Tetris.CanvasView(playerCanvas),
        new TetrisGA.MockGenerator(shapes.slice()),
        {
            onGameEnd: onGameEnd,
            onScoreUpdated: onScoreUpdated
        });
    playerTetris.run();

    var cpuTetris = null;
    function onScoreUpdated2(score) {
        $(settings.selector.cpuScore).text(score);
        if (score > parseInt($(settings.selector.cpuBest).text())) {
             $(settings.selector.cpuBest).text(score);
        }
    }

    function onGameEnd2(score) {
        cpuTetris = null;
    }

    function onScoreUpdated(score) {
        $(settings.selector.playerScore).text(score);
        if (score > parseInt($(settings.selector.playerBest).text())) {
             $(settings.selector.playerBest).text(score);
        }
    }

    function onGameEnd(score) {
        $(settings.selector.playerScore).text(0);
        playerTetris = new Tetris.Game(
            new Tetris.CanvasView(playerCanvas),
            new TetrisGA.MockGenerator(shapes.slice()),
            {
                onGameEnd: onGameEnd,
                onScoreUpdated: onScoreUpdated
            });
        playerTetris.run();
    }

    var workerPool = new TetrisGA.WorkerPool(settings.workers.script, settings.workers.num);
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

            if (cpuTetris == null) {
                $(settings.selector.cpuScore).text(0);

                var moves2 = TetrisGA.convertGenotypeToMoves(bestGenotype, shapes);
                var shapeBag2 = new TetrisGA.MockGenerator(shapes.slice());

                cpuTetris = new Tetris.Game(
                    new Tetris.CanvasView(cpuCanvas),
                    shapeBag2,
                    {
                        keysEnabled: false,
                        onGameEnd: onGameEnd2,
                        onScoreUpdated: onScoreUpdated2
                    });
                var player = new TetrisGA.ComputerPlayer(cpuTetris, moves2, null)
                player.play();
            }

            var avgScore = sumScores / settings.population;
            var li = $("<li>");
            li.text(bestScore + " (" + avgScore.toFixed(2) + ")");
            $(settings.selector.resultList).append(li);
            returned = 0;
            bestScore = 0;
            sumScores = 0;
            currentGeneration++;
            if (currentGeneration < settings.generations) {
                var parents = TetrisGA.tournamentSelection(genotypes);
                var children = TetrisGA.uniformCrossover(parents, settings.pc);
                var mutations = TetrisGA.mutationRandomReset(children, settings.pm);
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