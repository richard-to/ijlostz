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
        var shape = this.bag.pop();
        return new shape();
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
        if (this.moves) {
            this.tetris.handleKeyEvent(this.moves.pop());
            var self = this;
            window.setTimeout(function() {
                this.makeMove();
            }, this.reflexSpeed);
        } else {
            this.tetris.handlePauseToggle();
        }
    };
    TetrisGA.MovePlayer = MovePlayer;

})(window);