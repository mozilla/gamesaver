/******************************************************
/* TicTacToe.js 
/* Created By: Jesse Silver
/* Date: October 21, 2011
/* Usage: Create a new instance of TicTacToe, sending in
/* a canvas element id string as the parameter.
/* For use with: The Gladius Server Saving/Loading API
/*****************************************************/

var Rectangle = function(x, y, w, h) {
    var that = this;
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 0;
    this.h = h || 0;
    
    this.intersects = function(x,y,w,h) {
        if ((x > (that.x + that.w)) || ((x + w) < that.x) ||
            (y > (that.y + that.h)) || ((y + h) < that.y))
            return false;
        return true;
    };
    
    this.contains = function(x,y) {
        return (x >= that.x) && (x < that.x + that.w) && 
               (y >= that.y) && (y < that.y + that.h);
    };
};

var TTTCounter = function() {
    var that = this;
    this.nextID = 0;
    this.games = {};
    
    this.findNextID = function() {
        while (that.contains(that.nextID)) {
            ++that.nextID;
        };
    };

    this.add = function(winner, turn, id) {
        if (!id) {
            that.findNextID();
            id = that.nextID;
        }
        that.games[id] = {
            winner: winner,
            turn: turn,
            id: id
        };
    };
    
    this.contains = function(id) {
        return id in that.games;
    };
};

var FadingText = function(str, p) {
    this.alpha = 255;
    this.draw = function() {
        if (this.alpha) {
            p.fill(0,0,0,this.alpha);
            p.text(str, 600, 420);
            if (this.alpha > 230) this.alpha -= 3;
            else this.alpha -= 15;
        }
    }
};

var TicTacToe = function(c) {
    // Private Members
    var that = this, init = false, tiles = [], squares = [], 
        turn = 0, size = 0, finished = false, 
        startingTurn = 'X', otherTurn = 'O', counter = new TTTCounter(), 
        largeFont, smallFont, p, bIDImg, browserIDButton, browserID, fadingText;
    
    // Initialization
    
    function randomStart() {
        startingTurn = (Math.random() > 0.5) ? 'X' : 'O';
        otherTurn = (startingTurn === 'X') ? 'O' : 'X';
    }

    function clearTiles() {
        for (var i=0; i<9; ++i)
            tiles[i] = ' ';
    }

    function checkButtons() {
        if (browserID.loggedIn) {
            browserID.checkEmpty(function(empty) {
                if (empty) $('#load').hide();
                else $('#load').show();
            });
            $('#save').show();
        } else {
            $('#load').hide();
            $('#save').hide();
        }
    }
        
    function setup(processing) {
        browserID = new BrowserID('TicTacToe', that.loadData);
        checkButtons();
        p = processing;
        p.size(700, 430);
        size = 133;
        largeFont = p.createFont('Arial', 80);
        smallFont = p.createFont('Arial', 16);
        p.textFont(largeFont);
        init = true;
        for (var i=0; i<9; ++i) {
            squares[i] = new Rectangle(size*(i%3), size*(parseInt(i/3)), size, size);
            squares[i].draw = function() { p.rect(this.x, this.y, this.w, this.h); };
        }
        bIDImg = p.loadImage('sign_in_blue.png');
        browserIDButton = new Rectangle(2, 410, 79, 22);
        browserIDButton.draw = function() { 
            if (!browserID.loggedIn) p.image(bIDImg, this.x, this.y); 
            else p.text('Log Out', this.x, this.y+10);
        };
        if (!browserID.loggedIn) clearTiles();
        setupEvents();
        draw();
        setInterval(draw, 100);
    }

    // Saving/Loading

    this.loadData = function() {
        if (browserID.loggedIn) {
            fadingText = new FadingText('Now loading...', p);
            browserID.receive(function(save) {
                tiles = save.data.tiles;
                counter.games = save.data.results;
                startingTurn = save.data.startingTurn;
                otherTurn = save.data.otherTurn;
                turn = save.data.turn;
                finished = save.data.finished;
            });
        }
        checkButtons();
    };

    this.saveData = function() {
        if (browserID.loggedIn) {
            fadingText = new FadingText('Now saving...', p);
            browserID.send({
                results: counter.games,
                tiles: tiles,
                startingTurn: startingTurn,
                otherTurn: otherTurn,
                turn: turn,
                finished: finished
            });
            checkButtons();
        }
    };
    
    // Game Logic
    
    function setupEvents() {
        if (!browserID.loggedIn) randomStart();
        p.mouseClicked = function() {
            if (browserIDButton.contains(p.mouseX, p.mouseY)) {
                browserIDButton.onClick();
            } else {
                if (!finished) {
                    for (var i=0; i<squares.length; ++i) {
                        if (squares[i].contains(p.mouseX, p.mouseY) && tiles[i] === ' ') {
                            tiles[i] = (turn+1)%2==0 ? startingTurn : otherTurn;
                            ++turn;
                            checkWin();
                            if (!finished) that.onPlace(p);
                        }
                    }
                } else {
                    turn = 0;
                    clearTiles();
                    finished = false;
                    that.saveData();
                }
            }
            draw();
        };
        
        browserIDButton.onClick = function() {
            if (!browserID.loggedIn) 
                browserID.login(checkButtons, checkButtons);
            else 
                browserID.logout(checkButtons, checkButtons);
        }
    }
    
    function checkWin() {
        var win = false;
        for (var i=0, j=0; i<9 && !win; i+=3, ++j) {
            if (tiles[i] !== ' ' && tiles[i] === tiles[i+1] && tiles[i] === tiles[i+2])
                win = finish(tiles[i]);
            else if (tiles[j] !== ' ') {
                if (tiles[j] === tiles[j+3] && tiles[j] === tiles[j+6])
                    win = finish(tiles[j]);
                else if (j === 0 && tiles[j] === tiles[j+4] && tiles[j] === tiles[j+8])
                    win = finish(tiles[j]);
                else if (j === 2 && tiles[j] === tiles[j+2] && tiles[j] === tiles[j+4])
                    win = finish(tiles[j]);
            }
        }
        if (turn >= 9 && !win) win = finish('Draw');
    }
    
    function finish(winner) {
        finished = true;
        counter.add(winner, turn);
        setupEvents();
        that.onFinished(p);
        that.saveData();
        return true;
    }
    
    // Drawing
    
    function draw() {
        p.background(255);
        for (var i=0; i<squares.length; ++i)
            squares[i].draw();
        p.fill(0, 0, 0);
        for (var i=0; i<tiles.length; ++i) {
            var w = p.textWidth(tiles[i]);
            p.text(tiles[i], size*(i%3)+(size/2)-(w/2), 
                             size*(parseInt(i/3))+95);
        }
        p.fill(255, 255, 255);
        drawStats();
    }
        
    
    function drawStats() {
        var txt = '', g;
        for (var id in counter.games) {
            g = counter.games[id];
            txt += 'Game ID: ' + g.id + ', Winner: ' + g.winner + ', Turn: ' + g.turn + '\n';
        }
        p.fill(0, 0, 0);
        p.textFont(smallFont);
        p.text(txt, 410, 20);
        browserIDButton.draw();
        if (finished) p.text('Game Completed! Click to Continue...', 410, 400);
        if (browserID.loggedIn) p.text('Logged in: ' + browserID.email, 100, 420);
        if (fadingText) fadingText.draw();
        p.textFont(largeFont);
        p.fill(255, 255, 255);
    }
    
    // Public Events
    this.onFinished = function(processing) {};
    this.onPlace = function(processing) {};
    
    // Public Getters
    this.__defineGetter__('resultsLog', function() { return counter; });
    this.__defineGetter__('turnNumber', function() { return turn; });
    this.__defineGetter__('isFinished', function() { return finished; });
    
    // Create Processing.js instance
    (function() {
        new Processing(document.getElementById(c), setup)
    })();
}
