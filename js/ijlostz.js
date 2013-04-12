(function(window, undefined) {
    var Tetris = {};

    var Settings = {
        gridsize: 25,
        colormap: ["white", "cyan", "blue", "orange", "yellow", "green", "purple", "red"],
        stroke: {linewidth: 1, style: "black"},
    };
    Tetris.Settings = Settings;

    var RotationType = {
        LEFT: -1,
        RIGHT: 1
    };
    Tetris.RotationType = RotationType;

    var MoveType = {
        LEFT: {y: 0, x: -1},
        RIGHT: {y: 0, x: 1},
        SOFTDROP: {y: 1, x: 0}
    };
    Tetris.MoveType = MoveType;

    var Control = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };
    Tetris.Control = Control;

    var ShapeName = {
        I: "I",
        J: "J",
        L: "L",
        O: "O",
        S: "S",
        T: "T",
        Z: "Z"
    };
    Tetris.ShapeName = ShapeName;

    Tetris.ShapeI = function() {
        this.name = ShapeName.I;
        this.start = {y: 0, x: 3};
        this.id = 1;
        var n = this.id;
        this.shape = [
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [n, n, n, n],
                [0, 0, 0, 0]
            ],
            [
                [0, 0, n, 0],
                [0, 0, n, 0],
                [0, 0, n, 0],
                [0, 0, n, 0]
            ]
        ];
    };

    Tetris.ShapeJ = function() {
        this.name = ShapeName.J;
        this.start = {y: 1, x: 3};
        this.id = 2;
        var n = this.id;
        this.shape = [
            [
                [0, 0, 0],
                [n, n, n],
                [0, 0, n]
            ],
            [
                [0, n, 0],
                [0, n, 0],
                [n, n, 0],
            ],
            [
                [n, 0, 0],
                [n, n, n],
                [0, 0, 0]
            ],
            [
                [0, n, n],
                [0, n, 0],
                [0, n, 0],
            ],
        ];
    };

    Tetris.ShapeL = function() {
        this.name = ShapeName.L;
        this.start = {y: 1, x: 3};
        this.id = 3;
        var n = this.id;
        this.shape = [
            [
                [0, 0, 0],
                [n, n, n],
                [n, 0, 0]
            ],
            [
                [n, n, 0],
                [0, n, 0],
                [0, n, 0],
            ],
            [
                [0, 0, n],
                [n, n, n],
                [0, 0, 0]
            ],
            [
                [0, n, 0],
                [0, n, 0],
                [0, n, n],
            ],
        ];
    };

    Tetris.ShapeO = function() {
        this.name = ShapeName.O;
        this.start = {y: 1, x: 3};
        this.id = 4;
        var n = this.id;
        this.shape = [
            [
                [0, 0, 0, 0],
                [0, n, n, 0],
                [0, n, n, 0],
                [0, 0, 0, 0]
            ]
        ];
    };

    Tetris.ShapeS = function() {
        this.name = ShapeName.S;
        this.start = {y: 1, x: 3};
        this.id = 5;
        var n = this.id;
        this.shape = [
            [
                [0, 0, 0],
                [0, n, n],
                [n, n, 0]
            ],
            [
                [0, n, 0],
                [0, n, n],
                [0, 0, n]
            ]
        ];
    };

    Tetris.ShapeT = function() {
        this.name = ShapeName.T;
        this.start = {y: 1, x: 3};
        this.id = 6;
        var n = this.id;
        this.shape = [
            [
                [0, 0, 0],
                [n, n, n],
                [0, n, 0]
            ],
            [
                [0, n, 0],
                [n, n, 0],
                [0, n, 0]
            ],
            [
                [0, n, 0],
                [n, n, n],
                [0, 0, 0]
            ],
            [
                [0, n, 0],
                [0, n, n],
                [0, n, 0]
            ]
        ];
    };

    Tetris.ShapeZ = function() {
        this.name = ShapeName.Z;
        this.start = {y: 1, x: 3};
        this.id = 7;
        var n = this.id;
        this.shape = [
            [
                [0, 0, 0],
                [n, n, 0],
                [0, n, n]
            ],
            [
                [0, 0, n],
                [0, n, n],
                [0, n, 0]
            ]
        ];
    };

    Tetris.ShapeList = [
        Tetris.ShapeI,
        Tetris.ShapeJ,
        Tetris.ShapeL,
        Tetris.ShapeO,
        Tetris.ShapeS,
        Tetris.ShapeT,
        Tetris.ShapeZ
    ];

    Tetris.Block = function(shapeType) {
        this.shapeType = shapeType;
        this.rotation = 0;
        this.name = this.shapeType.name;
        this.shape = this.shapeType.shape[this.rotation];
        this.height = this.shape.length;
        this.width = this.shape[0].length;
        this.y = this.shapeType.start.y;
        this.x = this.shapeType.start.x;
    };

    Tetris.Block.prototype.rotate = function(direction) {
        var newRotation = this.rotation + direction;
        if (newRotation < 0) {
            newRotation = this.shapeType.shape.length + newRotation;
        } else {
            newRotation %= this.shapeType.shape.length;
        }
        this.rotation = newRotation;
        this.shape = this.shapeType.shape[this.rotation];
    };

    Tetris.Block.prototype.move = function(move) {
        this.y += move.y;
        this.x += move.x;
    };

    Tetris.Board = function() {
        this.width = 10;
        this.height = 22;
        this.rowstart = 2;
        this.frozenState = this.init(this.height, this.width);
        this.activeState = this.cloneState(this.frozenState);
    };

    Tetris.Board.prototype.init = function(height, width) {
        var state = new Array(height);
        for (var y = 0; y < height; ++y) {
            state[y] = new Array(width);
            for (var x = 0; x < width; ++x) {
                state[y][x] = 0;
            }
        }
        return state;
    };

    Tetris.Board.prototype.cloneState = function(state) {
        return $.extend(true, [], state);
    };

    Tetris.Board.prototype.update = function(state, block) {
        var updatedState = $.extend(true, [], state);
        var shape = block.shape;
        var height = block.height;
        var width = block.width;
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var yPos = block.y + y;
                var xPos = block.x + x;
                if (yPos >= 0 && xPos >= 0) {
                    updatedState[yPos][xPos] = shape[y][x];
                }
            }
        }
        return updatedState;
    };

    Tetris.Debug = {
        printBoardState: function(state) {
            var out = "";
            var height = state.length;
            var width = state[0].length;
            for (var y = 0; y < height; ++y) {
                for (var x = 0; x < width; ++x) {
                    out += state[y][x] + " ";
                }
                out += "\n";
            }
            console.log(out);
        }
    };

    Tetris.CanvasView = {
        paint: function(canvas, board, settings) {
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.lineWidth = settings.stroke.linewidth;
            context.strokeStyle = settings.stroke.style;

            var gridsize = settings.gridsize;
            var colormap = settings.colormap;
            var state = board.activeState;
            var rowstart = board.rowstart;
            var height = board.height;
            var width = board.width;

            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    if (state[y][x] > 0) {
                        var cy = (y - rowstart) * gridsize;
                        var cx = x * gridsize;
                        context.beginPath();
                        context.rect(cx, cy, gridsize, gridsize);
                        context.fillStyle = colormap[state[y][x]];
                        context.fill();
                        context.stroke();
                    }
                }
            }
        }
    };

    window.Tetris = Tetris;
})(window);