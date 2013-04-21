(function(window, undefined) {

    // Main namespace for Tetris Genetic Algorithm.
    var TetrisGA = {};

    // Settings for Tetris GA.
    var Settings = {
        view: NullView
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

    MockGenerator.prototype.nextShape = function() {
        var shape = this.bag.shift();
        return shape;
    };
    TetrisGA.MockGenerator = MockGenerator;

    var MovePlayer = function(tetris, moves, reflexSpeed) {
        this.tetris = tetris;
        this.moves = moves;
        this.reflexSpeed = reflexSpeed;
    };

    MovePlayer.prototype.play = function() {
        this.tetris.run();
        this.makeMove();
    };

    MovePlayer.prototype.makeMove = function() {
        if (this.moves.length > 0) {
            this.tetris.handleKeyEvent(this.moves.shift());
            var self = this;
            window.setTimeout(function() {
                self.makeMove();
            }, this.reflexSpeed);
        } else {
            this.tetris.handlePauseToggle();
        }
    };
    TetrisGA.MovePlayer = MovePlayer;

    var Control = Tetris.Control;
    var GenotypeToMoveSequencer = {
        sequence: function(genotype, shapes) {
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
                    var moves1 = shapes[i].start.x;
                    while(moves1 < coordX[i]) {
                        moves.push(Control.RIGHT);
                        moves1++;
                    }

                    var xSpace = 0;
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
                        moves.push(Control.LEFT);
                        xSpace++;
                    }
                }
                moves.push(Control.HARDDROP);
            }
            return moves;
        }
    };
    TetrisGA.GenotypeToMoveSequencer = GenotypeToMoveSequencer;

    window.TetrisGA = TetrisGA;
})(window);