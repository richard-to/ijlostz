(function() {
    var CANVAS_ID = "board";
    var EL = "body";

    var canvas = document.getElementById(CANVAS_ID);

    var randomGen = new Tetris.RandomGenerator(Tetris.ShapeList);
    var shapes = TetrisGA.initializeShapes(10, randomGen);

    var sequence = TetrisGA.initializeGenePool(6, shapes.length);

    window.simulate = simulate;
    window.simulate(sequence, 0, shapes);

    var generations = 4;
    var current = 0;
    function simulate(sequence, index, shapes) {
        var moves = TetrisGA.convertGenotypeToMoves(sequence[index], shapes);
        var shapeBag = new TetrisGA.MockGenerator(_.clone(shapes));
        var tetris = new Tetris.Game(
            EL, new TetrisGA.CanvasView(canvas), shapeBag, {keysEnabled: false});
        var self = this;
        var player = new TetrisGA.ComputerPlayer(tetris, moves, 200, function(score) {
            sequence[index].fitness = score;
            index++;
            if (index < sequence.length) {
                self.simulate(sequence, index, shapes);
            } else {
                var parents = TetrisGA.tournamentSelection(sequence);
                var children = TetrisGA.crossoverNPoint(parents, 2, .9);
                var mutations = TetrisGA.mutationRandomReset(children, 0.1);
                current++;
                if (current < 4)
                    self.simulate(sequence, 0, shapes);
            }
        });
        player.play();
    }
})();