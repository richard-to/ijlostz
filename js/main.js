(function() {
    var CANVAS_ID = "board";
    var EL = "body";

    var canvas = document.getElementById(CANVAS_ID);

    var shapes = [Tetris.ShapeS, Tetris.ShapeO, Tetris.ShapeL];
    var shapeBag = new TetrisGA.MockGenerator(shapes);

    var tetris = new Tetris.Game(
        EL, new Tetris.CanvasView(canvas), shapeBag, {keysEnabled: false});

    var Control = Tetris.Control;
    var moves = [
        Control.LEFT,
        Control.LEFT,
        Control.LEFT,
        Control.HARDDROP,
        Control.RIGHT,
        Control.RIGHT,
        Control.RIGHT,
        Control.HARDDROP
    ];

    var movePlayer = new TetrisGA.MovePlayer(tetris, moves, 150);
    movePlayer.play();
})();