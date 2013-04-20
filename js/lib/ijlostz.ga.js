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
    // The settings object here refers to the
    NullView.prototype.paint = function(board, settings) {};
})(window);