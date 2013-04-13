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
        SPACEBAR: 32,
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

    var ShapeI = function() {
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
    Tetris.ShapeI = ShapeI;

    var ShapeJ = function() {
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
    Tetris.ShapeJ = ShapeJ;

    var ShapeL = function() {
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
    Tetris.ShapeL = ShapeL;

    var ShapeO = function() {
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
    Tetris.ShapeO = ShapeO;

    var ShapeS = function() {
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
    Tetris.ShapeS = ShapeS;

    var ShapeT = function() {
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
    Tetris.ShapeT = ShapeT;

    var ShapeZ = function() {
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
    Tetris.ShapeZ = ShapeZ;

    var ShapeList = [ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ];
    Tetris.ShapeList = ShapeList;

    var Block = function(shapeType) {
        this.shapeType = shapeType;
        this.rotation = 0;
        this.name = this.shapeType.name;
        this.shape = this.shapeType.shape[this.rotation];
        this.height = this.shape.length;
        this.width = this.shape[0].length;
        this.y = this.shapeType.start.y;
        this.x = this.shapeType.start.x;
    };

    Block.prototype.clone = function() {
        var block = new Block(this.shapeType);
        block.rotation = this.rotation;
        block.shape = this.shape;
        block.y = this.y;
        block.x = this.x;
        return block;
    };
    Tetris.Block = Block;

    var Board = function() {
        this.width = 10;
        this.height = 22;
        this.rowstart = 2;
        this.frozenState = this.init(this.height, this.width);
        this.activeState = this.cloneState(this.frozenState);
    };

    Board.prototype.init = function(height, width) {
        var state = new Array(height);
        for (var y = 0; y < height; ++y) {
            state[y] = new Array(width);
            for (var x = 0; x < width; ++x) {
                state[y][x] = 0;
            }
        }
        return state;
    };

    Board.prototype.cloneState = function(state) {
        return $.extend(true, [], state);
    };

    Board.prototype.rotate = function(block, direction) {
        var newBlock = block.clone();
        var newRotation = newBlock.rotation + direction;
        if (newRotation < 0) {
            newRotation = newBlock.shapeType.shape.length + newRotation;
        } else {
            newRotation %= newBlock.shapeType.shape.length;
        }
        newBlock.rotation = newRotation;
        newBlock.shape = newBlock.shapeType.shape[newBlock.rotation];
        return newBlock;
    };

    Board.prototype.move = function(block, move) {
        var newBlock = block.clone();
        newBlock.y += move.y;
        newBlock.x += move.x;
        return newBlock;
    };

    Board.prototype.update = function(state, block) {
        var updatedState = $.extend(true, [], state);
        var statey = state.length;
        var statex = state[0].length;
        var shape = block.shape;
        var height = block.height;
        var width = block.width;

        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var yPos = block.y + y;
                var xPos = block.x + x;
                if (shape[y][x] > 0 && yPos >= 0 && xPos >= 0 && yPos < statey && xPos < statex) {
                    updatedState[yPos][xPos] = shape[y][x];
                }
            }
        }
        return updatedState;
    };

    Board.prototype.isValid = function(state, block) {
        var statey = state.length;
        var statex = state[0].length;
        var shape = block.shape;
        var height = block.height;
        var width = block.width;

        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var yPos = block.y + y;
                var xPos = block.x + x;
                if (shape[y][x] > 0 && (yPos < 0 || xPos < 0 ||
                        yPos >= statey || xPos >= statex || state[yPos][xPos] > 0)) {
                    return false;
                }
            }
        }
        return true;
    };

    Board.prototype.isBlockFrozen = function(state, block) {
        var statey = state.length;
        var statex = state[0].length;
        var shape = block.shape;
        var height = block.height;
        var width = block.width;
        var blocky = block.y + 1;
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var yPos = blocky + y;
                var xPos = block.x + x;
                if (shape[y][x] > 0 && (yPos >= statey || xPos >= statex || state[yPos][xPos] > 0)) {
                    return true;
                }
            }
        }
        return false;
    };

    Board.prototype.findLines = function() {
        var state = this.frozenState;
        var height = state.length;
        var width = state[0].length;
        var foundLines = false;
        var lines = {};
        for (var y = 0; y < height; ++y) {
            var isLine = true;;
            for (var x = 0; x < width; ++x) {
                if (state[y][x] == 0) {
                    isLine = false;
                    break;
                }
            }
            if (isLine) {
                lines[y] = true;
                foundLines = true;
            }
        }
        return (foundLines) ? lines : null;
    }

    Board.prototype.clearLines = function(lines) {
        var frozenState = this.frozenState;
        var state = this.init(this.height, this.width);
        var height = state.length - 1;
        var width = state[0].length - 1;
        var currentHeight = height;
        for (var y = height; y >= 0; --y) {
            var isLine = true;
            if (!lines[y]) {
                state[currentHeight] = frozenState[y].slice();
                currentHeight--;

            }
        }
        return state;
    }

    Tetris.Board = Board;

    var CanvasView = {
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
    Tetris.CanvasView = CanvasView;

    var RandomGenerator = function(shapes) {
        this.shapes = shapes;
        this.bag = this.generate(this.shapes);
    };

    RandomGenerator.prototype.generate = function(shapes) {
        return _.shuffle(shapes);
    }

    RandomGenerator.prototype.nextShape = function() {
        if (this.bag.length == 0) {
            this.bag = this.generate(this.shapes);
        }
        var shape = this.bag.pop();
        return new shape();
    };

    Tetris.RandomGenerator = RandomGenerator;

    var Debug = {
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
    Tetris.Debug = Debug;

    var ScoreSystem = function() {
        this.lineScore = [0, 40, 100, 300, 1200];
    };

    ScoreSystem.prototype.calculate = function(numLines, level) {
        var baseScore = this.lineScore[numLines];
        return baseScore * (level + 1);
    }
    Tetris.ScoreSystem = ScoreSystem;

    var Game = function(el, canvas, view, shapeBag, settings) {
        this.$el = el instanceof $ ? el : $(el);
        this.el = this.$el[0];
        this.settings = _.extend(Settings, settings);
        this.canvas = canvas;
        this.debug = Debug;
        this.shapeBag = shapeBag || new RandomGenerator(ShapeList);
        this.scoreSystem = new ScoreSystem();
        this.view = view || CanvasView;
        this.board = new Board();

        this.score = 0;
        this.level = 0;

        var self = this;
        this.keyevents = {};
        this.keyevents[Control.LEFT] = function() {
            self.handleAction(self.board.move(self.block, MoveType.LEFT));
        };
        this.keyevents[Control.RIGHT] = function() {
            self.handleAction(self.board.move(self.block, MoveType.RIGHT));
        };
        this.keyevents[Control.UP] = function() {
            self.handleAction(self.board.rotate(self.block, RotationType.RIGHT));
        };
        this.keyevents[Control.DOWN] = function() {
            self.handleSoftDrop();
        };
        this.keyevents[Control.SPACEBAR] = function() {
            self.handleHardDrop();
        };

        this.$el.keydown(function(e) {
            var action = self.keyevents[e.keycode] || self.keyevents[e.which];
            if (_.isFunction(action)) {
                action();
                e.preventDefault();
            }
        });
    };

    Game.prototype.run = function() {
        this.block = new Block(this.shapeBag.nextShape());
        this.board.activeState = this.board.update(this.board.frozenState, this.block);
        this.updateView();
    };

    Game.prototype.handleHardDrop = function() {
        var board = this.board;
        var block = this.block.clone();
        while (board.isBlockFrozen(board.frozenState, block) == false) {
            block = board.move(block, MoveType.SOFTDROP);
        }
        board.frozenState = board.update(board.frozenState, block);
        this.clearLines();
        block = new Block(this.shapeBag.nextShape());
        board.activeState = board.update(board.frozenState, block);
        this.block = block;
        this.updateView();
        return true;
    };

    Game.prototype.handleSoftDrop = function() {
        var board = this.board;
        var block = board.move(this.block, MoveType.SOFTDROP);
        var actionResult = this.handleAction(block);
        if (!actionResult && board.isBlockFrozen(board.frozenState, block)) {
            board.frozenState = board.activeState;
            this.clearLines();
            block = new Block(this.shapeBag.nextShape());
            board.activeState = board.update(board.frozenState, block);
            this.block = block;
            this.updateView();
            actionResult = true;
        }
        return actionResult;
    };

    Game.prototype.handleAction = function(block) {
        var board = this.board;
        if (board.isValid(board.frozenState, block)) {
            this.block = block;
            board.activeState = board.update(board.frozenState, block);
            this.updateView();
            return true;
        } else {
            return false;
        }
    };

    Game.prototype.clearLines = function() {
        var board = this.board;
        var lines = board.findLines();
        if (lines) {
            var state = board.clearLines(lines);
            board.frozenState = state;
            var numLines = 0;
            for (var k in lines) {
                numLines++;
            }
            this.score += this.scoreSystem.calculate(numLines, this.level);
            console.log(this.score);
        }
    }

    Game.prototype.updateView = function() {
        this.view.paint(this.canvas, this.board, this.settings);
    };

    Tetris.Game = Game;

    window.Tetris = Tetris;
})(window);