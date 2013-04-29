(function() {

    // Global settings for Tetris GA
    var settings = {
        population: 100,
        shapeList: Tetris.ShapeList,
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

    // Get canvas elements that represent game board.
    var playerCanvas = document.getElementById(settings.id.playerCanvas);
    var cpuCanvas = document.getElementById(settings.id.cpuCanvas);

    // Random tetromino generator given a list of valid shapes.
    var randomGen = new Tetris.RandomGenerator(settings.shapeList);

    // Initialize a random sequence of n shapes with Random generator.
    var shapes = TetrisGA.initializeShapes(settings.shapes, randomGen);

    // Create n genotypes for generation 0.
    var genotypes = TetrisGA.initializeGenePool(settings.population, shapes.length);

    // Create tetris game for player.
    var playerTetris = new Tetris.Game(
        new Tetris.CanvasView(playerCanvas),
        new TetrisGA.MockGenerator(shapes.slice()),
        {
            onGameEnd: onPlayerGameEnd,
            onScoreUpdated: onPlayerScoreUpdated
        });
    playerTetris.run();

    // Callback that updates player score when score changes.
    function onPlayerScoreUpdated(score) {
        $(settings.selector.playerScore).text(score);
        if (score > parseInt($(settings.selector.playerBest).text())) {
             $(settings.selector.playerBest).text(score);
        }
    }

    // Callback that restarts tetris game for player after Tetrominos sequence finished.
    function onPlayerGameEnd(score) {
        $(settings.selector.playerScore).text(0);
        playerTetris = new Tetris.Game(
            new Tetris.CanvasView(playerCanvas),
            new TetrisGA.MockGenerator(shapes.slice()),
            {
                onGameEnd: onPlayerGameEnd,
                onScoreUpdated: onPlayerScoreUpdated
            });
        playerTetris.run();
    }

    // Initialize a null cpuTetris player. Instantiate when worker jobs completed for each generation if
    // value is still null.
    var cpuTetris = null;

    // Callback that update CPU score.
    function onCpuScoreUpdated(score) {
        $(settings.selector.cpuScore).text(score);
        if (score > parseInt($(settings.selector.cpuBest).text())) {
             $(settings.selector.cpuBest).text(score);
        }
    }

    // Callback that sets cpuTetris back to null so a new simulation can be run if available.
    function onCpuGameEnd(score) {
        cpuTetris = null;
    }

    // Run Tetris GA simulation using Worker pool.
    var workerPool = new TetrisGA.WorkerPool(settings.workers.script, settings.workers.num);
    for (var i = 0; i < genotypes.length; i++) {
        workerPool.runJob({genotype: genotypes[i], shapes: shapes}, onJobCompleted);
    }

    var jobsCompleted = 0;
    var currentGeneration = 0;
    var bestFitness = 0;
    var bestGenotype = null;
    var sumFitness = 0;

    // Callback for when web worker jobs completed
    // Returns a genotype with simulated fitness value.
    //
    // Need to refactor this at some point.
    function onJobCompleted(genotype) {
        // Keep track of completed jobs. Once all completed, then move
        // we can move to next generation.
        jobsCompleted++;

        // Add up fitness so we can average them out later.
        sumFitness += genotype.fitness;

        // Keep track of best genotype of generation.
        if (genotype.fitness >= bestFitness) {
            bestFitness = genotype.fitness;
            bestGenotype = TetrisGA.cloneGenotype(genotype);
        }

        // Generation end condition is when all genotypes have been simulated.
        if (jobsCompleted === genotypes.length) {

            // If no cpu simulation is running, run the best simulation.
            if (cpuTetris == null) {
                $(settings.selector.cpuScore).text(0);

                var moves2 = TetrisGA.convertGenotypeToMoves(bestGenotype, shapes);
                var shapeBag2 = new TetrisGA.MockGenerator(shapes.slice());

                cpuTetris = new Tetris.Game(
                    new Tetris.CanvasView(cpuCanvas),
                    shapeBag2,
                    {
                        keysEnabled: false,
                        onGameEnd: onCpuGameEnd,
                        onScoreUpdated: onCpuScoreUpdated
                    });
                var player = new TetrisGA.ComputerPlayer(cpuTetris, moves2, null)
                player.play();
            }

            // Average the sum of all fitness values.
            var avgScore = sumFitness / settings.population;

            // Display results to UI.
            var li = $("<li>");
            li.text(bestFitness + " (" + avgScore.toFixed(2) + ")");
            $(settings.selector.resultList).append(li);

            jobsCompleted = 0;
            bestFitness = 0;
            sumFitness = 0;
            currentGeneration++;

            // Simulate the next generation if there are more to do.
            //
            // 1. Select parents
            // 2. Perform crossover on parents
            // 3. Mutation children
            // 4. Simulate fitness values of new generation
            // 5. Repeat.
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