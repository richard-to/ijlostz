(function() {
    var CANVAS_ID = "board";
    var EL = "body";

    var canvas = document.getElementById(CANVAS_ID);

    var shapes = [Tetris.ShapeS, Tetris.ShapeO, Tetris.ShapeL];
    var shapeBag = new TetrisGA.MockGenerator(shapes);

    var sequence = {
        coordX: [2, 9, 0],
        rotation: [0, 3, 1]
    };
    var moves = TetrisGA.GenotypeToMoveSequencer.sequence(
        sequence, Tetris.ShapeList);
    console.log(moves);

    var tetris = new Tetris.Game(
        EL, new Tetris.CanvasView(canvas), shapeBag, {keysEnabled: true});

    var movePlayer = new TetrisGA.MovePlayer(tetris, moves, 150);
    movePlayer.play();

})();