(function(window, undefined) {

    var Tetris = window.Tetris;

    // Main namespace for Tetris Genetic Algorithm.
    var TetrisGA = {};

    // Settings for Tetris GA.
    var Settings = {
        view: NullView,
        maxCoordX: 10,
        maxRotation: 4
    };
    TetrisGA.Settings = Settings;

    // A view object that does nothing. It is not necessary
    // to show the canvas when running the simulation.
    var NullView = function() {};

    // Override the paint method to do nothing.
    // The settings object here refers to the settings in Tetris
    // module.
    NullView.prototype.paint = function(board, settings) {};
    TetrisGA.NullView = NullView;

    // Pass in a known sequence of shapes for testing GA.
    var MockGenerator = function(shapeSequence) {
        this.bag = shapeSequence;
    };

    // Override nextShape method to only shift off
    // available shapes. Once no shapes exist return
    // a null shape.
    MockGenerator.prototype.nextShape = function() {
        var shape = this.bag.shift();
        if (shape == null) {
            throw new Error();
        }
        return shape;
    };
    TetrisGA.MockGenerator = MockGenerator;

    // Clones genotype
    var cloneGenotype = function(genotype) {
        return {
            coordX: genotype.coordX.slice(),
            rotation: genotype.rotation.slice(),
            fitness: genotype.fitness
        };
    };
    TetrisGA.cloneGenotype = cloneGenotype;

    var randCoordX = function() {
        return _.random(Settings.maxCoordX - 1);
    };
    TetrisGA.randCoordX = randCoordX;

    var randRotation = function() {
        return _.random(Settings.maxRotation - 1);
    };
    TetrisGA.randRotation = randRotation;

    var Control = Tetris.Control;

    // Function that converts genotype into a sequence of
    // moves for the computer player.
    //
    // TODO: Clean up function.
    var convertGenotypeToMoves = function(genotype, shapes) {
        var moves = [];
        var coordX = genotype.coordX;
        var rotation = genotype.rotation;
        var length = coordX.length;
        for (var i = 0; i < length; i++) {
            if (rotation[i] == 1) {
                moves.push(Control.ROTATE_RIGHT);
            } else if (rotation[i] == 2) {
                moves.push(Control.ROTATE_RIGHT);
                moves.push(Control.ROTATE_RIGHT);
            } else if (rotation[i] == 3) {
                moves.push(Control.ROTATE_LEFT);
            }
            if (coordX[i] < shapes[i].start.x) {
                var shapeIndex = rotation[i] % shapes[i].shape.length;
                var shape = shapes[i].shape[shapeIndex];
                var moves1 = shapes[i].start.x;
                while(moves1 > coordX[i]) {
                    moves.push(Control.LEFT);
                    moves1--;
                }

                var xSpace = 0;
                var found = false;
                for (var x = 0; x < shape[0].length; x++) {
                    for (var y = 0; y < shape.length; y++) {
                        if (shape[y][x] > 0) {
                            xSpace = x;
                            found = true;
                            break;
                        }
                    }
                    if (found)
                        break;
                }

                while (xSpace > 0) {
                    moves.push(Control.LEFT);
                    xSpace--;
                }
            } else if (coordX[i] > shapes[i].start.x) {
                var shapeIndex = rotation[i] % shapes[i].shape.length;
                var shape = shapes[i].shape[shapeIndex];
                var moves1 = shapes[i].start.x + shape[0].length - 1;
                while (moves1 < coordX[i]) {
                    moves.push(Control.RIGHT);
                    moves1++;
                }

                var xSpace = shape[0].length - 1;
                var found = false;
                for (var x = shape[0].length - 1; x >= 0; x--) {
                    for (var y = 0; y < shape.length; y++) {
                        if (shape[y][x] > 0) {
                            xSpace = x;
                            found = true;
                            break;
                        }
                    }
                    if (found)
                        break;
                }

                while (xSpace < shape[0].length - 1) {
                    moves.push(Control.RIGHT);
                    xSpace++;
                }
            }
            moves.push(Control.HARDDROP);
        }
        return moves;
    };
    TetrisGA.convertGenotypeToMoves = convertGenotypeToMoves;

    // Initializes random sequence of shapes
    var initializeShapes = function(tetrominoCount, generator) {
        var shapes = [];
        _(tetrominoCount).times(function(n){
            shapes.push(generator.nextShape());
        });
        return shapes;
    };
    TetrisGA.initializeShapes = initializeShapes;

    // Function that initializes a gene pool that represents
    // possible move sequences for each Tetromino.
    var initializeGenePool = function(populationSize, tetrominoCount) {
        var genePool = [];
        _(populationSize).times(function(n){
            var sequence = {
                coordX: [],
                rotation: []
            };
            _(tetrominoCount).times(function(n){
                sequence.coordX.push(randCoordX());
                sequence.rotation.push(randRotation());
            });
            genePool.push(sequence);
        });
        return genePool;
    };
    TetrisGA.initializeGenePool = initializeGenePool;

    // Select parents using tournament selection.
    // Tournament uses 2 parents only for now.
    var tournamentSelection = function(genotypes) {
        var parents = [];
        while (parents.length < genotypes.length) {
            var challenger1 = genotypes[_.random(genotypes.length - 1)];
            var challenger2 = genotypes[_.random(genotypes.length - 1)];
            if (challenger1.fitness > challenger2.fitness) {
                parents.push(cloneGenotype(challenger1));
            } else {
                parents.push(cloneGenotype(challenger2));
            }
        }
        return parents;
    };
    TetrisGA.tournamentSelection = tournamentSelection;

    // N-point crossover
    var crossoverNPoint = function(genotypes, n, pc) {
        var children = [];
        var length = genotypes.length / 2;
        var crossPoints = [];
        for (i = 0; i < n; i++) {
            crossPoints.push(_.random(1, 8));
        }
        crossPoints = _.sortBy(
            crossPoints, function(num){ return num });
        crossPoints = _.uniq(crossPoints);
        for (var i = 0; i < length; i++) {
            var index = i * 2;
            var index2 = index + 1;
            var p1 = cloneGenotype(genotypes[index]);
            var p2 = cloneGenotype(genotypes[index2]);
            if (Math.random() < pc) {
                var cIndex = 0;
                var swap = false;

                for (var g = 0; g < p1.coordX.length; g++) {
                    if (cIndex != null && crossPoints[cIndex] == g) {
                        cIndex++;
                        if (cIndex < crossPoints.length) {
                            cIndex = null;
                        }
                        swap = swap === false ? true : false;
                    }
                    if (swap) {
                        var tempX = p1.coordX[g];
                        var tempRot = p1.rotation[g];
                        p1.coordX[g] = p2.coordX[g];
                        p1.rotation[g] = p2.rotation[g];
                        p2.coordX[g] = tempX;
                        p2.rotation[g] = tempRot;
                    }
                }
            }
            children.push(p1);
            children.push(p2);
        }
        return children;
    };
    TetrisGA.crossoverNPoint = crossoverNPoint;

    // Mutation using random reset algorithm for integers.
    var mutationRandomReset = function(genotypes, pm) {
        var mutations = [];
        for (var i = 0; i < genotypes.length; i++) {
            mutations.push(cloneGenotype(genotypes[i]));
        }
        for (var i = 0; i < genotypes.length; i++) {
            for (var g = 0; g < genotypes[i].coordX.length; g++) {
                if (Math.random() < pm) {
                   mutations[i].coordX[g] = randCoordX();
                }
                if (Math.random() < pm) {
                    mutations[i].rotation[g] = randRotation();
                }
            }
            return mutations;
        }
    };
    TetrisGA.mutationRandomReset = mutationRandomReset;


    // A Computer player that plays tetris using a specific
    // sequence of moves at a constant speed per move.
    var ComputerPlayer = function(tetris, moves, reflexSpeed) {
        this.tetris = tetris;
        this.moves = moves;
        this.reflexSpeed = reflexSpeed || 0;
    };

    // Start playing Tetris.
    ComputerPlayer.prototype.play = function() {
        this.tetris.run();
        this.makeMove();
    };

    // Makes next move in the sequence of moves.
    // Once moves run out. Pause the game.
    ComputerPlayer.prototype.makeMove = function() {
        if (this.tetris.state === Tetris.GameState.RUNNING && this.moves.length > 0) {
            this.tetris.handleKeyEvent(this.moves.shift());
            var self = this;

            if (this.reflexSpeed > 0) {
                setTimeout(function() {
                    self.makeMove();
                }, this.reflexSpeed);
            } else {
                self.makeMove();
            }
        }
    };
    TetrisGA.ComputerPlayer = ComputerPlayer;

    // Calculate fitness
    //
    // Lower stack height is better. Max score 22.
    // Higher score is better.
    var calculateFitness = function(tetris, score) {
        var state = tetris.frozenBoard.state;
        var height = tetris.frozenBoard.height;
        var width = tetris.frozenBoard.width;
        for (var y = 0; y < height; ++y) {
            var isLine = true;
            for (var x = 0; x < width; ++x) {
                if (state[y][x] !== 0) {
                    return y + score;
                    break;
                }
            }
        }
        return score;
    }
    TetrisGA.calculateFitness = calculateFitness;

    // Simulate Tetris and calculate fitness based on
    // score.
    var simulateFitness = function(genotype, shapes, reflexSpeed, callback) {
        var self = this;
        var moves = convertGenotypeToMoves(genotype, shapes);
        var shapeBag = new MockGenerator(_.clone(shapes));
        var tetris = new Tetris.Game(
            new NullView(),
            shapeBag,
            {
                keysEnabled: false,
                onGameEnd: function(score) {
                    genotype.fitness = calculateFitness(tetris, score);
                    callback(genotype);
                }
            }
        );
        var player = new ComputerPlayer(tetris, moves, reflexSpeed)
        player.play();
    };
    TetrisGA.simulateFitness = simulateFitness;

    window.TetrisGA = TetrisGA;
})(window);