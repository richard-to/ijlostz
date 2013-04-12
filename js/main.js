(function() {
    var CANVAS_ID = "board";
    var EL = "body";

    var canvas = document.getElementById(CANVAS_ID);
    var tetris = new Tetris.Game(EL, canvas);
})();