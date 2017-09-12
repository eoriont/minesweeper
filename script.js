document.addEventListener("DOMContentLoaded", function() {
    let WIDTH = 500;
    let HEIGHT = 500;
    let canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    document.body.insertBefore(canvas, document.body.childNodes[1]);
    let ctx = canvas.getContext("2d");
    let mousePos = {x: 0, y: 0};
    let mp = {x: 0, y: 0};
    let squares = [];
    let squaresHeight = 20;
    let squaresWidth = 20;
    let clicked = false;
    let w = WIDTH/squaresWidth;
    let h = WIDTH/squaresHeight;
    let gameState = 1;
    let bombAmount = 0;
    let canCheat = true;
    makeSquares();

    function getMousePos(e) {
        let rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
        mp = {x: round(mousePos.x, 25)/25, y: round(mousePos.y, 25)/25};
        return mousePos;
    }

    canvas.addEventListener("mousemove", (e) => {
        getMousePos(e);
        renderSquares();
    });

    function renderSquares() {
        mp = {x: round(mousePos.x, 25)/25, y: round(mousePos.y, 25)/25};
        let num = ((mp.y*squaresWidth)-squaresWidth)+mp.x;

        squares.forEach((square) => {
            let x = square.x;
            let y = square.y;
            let squarenum = (((y+1)*squaresWidth)-squaresWidth)+(x+1);
            //let squarenum = (x*squaresWidth)+y;
            ctx.beginPath();
            ctx.rect(x*w, y*h, w, h);
            ctx.fillStyle = '#a6a6a6';
            if (square.clicked) ctx.fillStyle = 'lightgrey';
            if (squarenum == num) ctx.fillStyle = 'grey';
            if (square.flagged) ctx.fillStyle = 'red';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            if (square.clicked) {
                drawDangerText(square.danger, x*w+(w/6), y*h+((h/8)*7));
            }
        });
        if (gameState == 0) {
            ctx.fillStyle = "red";
            ctx.font = 'italic 50pt Arial';
            ctx.fillText("Game Over!", (WIDTH/2)-WIDTH/3, (HEIGHT/2));
        }
        if (gameState == 2) {
            ctx.fillStyle = "green";
            ctx.font = 'italic 50pt Arial';
            ctx.fillText("You Win!", (WIDTH/2)-WIDTH/3, (HEIGHT/2));
        }
    }

    function gameOver() {
        if (gameState != 0) return;
        canCheat = true;
        cheat();
    }

    function drawDangerText(d, x, y) {
        let color = "";
        if (d == -1) color = "black";
        if (d == 0) {
            return;
        } else if (d == 1) {
            color = "blue";
        } else if (d == 2) {
            color = "green";
        } else if (d == 3) {
            color = "red";
        } else if (d == 4) {
            color = "darkblue";
        } else if (d == 5) {
            color = "darkorange";
        } else if (d == 6) {
            color = "firebrick";
        } else if (d == 7) {
            color = "fuchsia";
        } else if (d == 8) {
            color = "gold";
        }

        ctx.fillStyle = color;
        ctx.font = 'italic 20pt Calibri';
        ctx.fillText(d, x, y);
    }

    function round(x, y) {
        return Math.ceil(x/y)*y;
    }

    function makeSquares() {
        for (let x = 0; x < squaresWidth; x++) {
            for (let y = 0; y < squaresHeight; y++) {
                ctx.beginPath();
                ctx.rect(x*w, y*h, w, h);
                ctx.fillStyle = 'lightgrey';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'black';
                ctx.stroke();
                squares.push({clicked: false, danger: 0, x, y, flagged: false});
            }
        }
    }

    function createSquares() {
        for (let x = 0; x < squaresWidth; x++) {
            for (let y = 0; y < squaresHeight; y++) {
                let num = (x*squaresWidth)+y;
                let square = squares[num];
                if (square.danger == -1) {
                    ifBomb(x-1, y-1);
                    ifBomb(x, y-1);
                    ifBomb(x-1, y);
                    ifBomb(x+1, y);
                    ifBomb(x-1, y+1);
                    ifBomb(x, y+1);
                    ifBomb(x+1, y+1);
                    ifBomb(x+1, y-1);
                }
            }
        }
    }

    function ifBomb(x, y) {
        let num = (x*squaresWidth)+y;
        let square = squares[num];
        if (square != null) {
            if (square.danger != -1) {
                square.danger += 1;
            }
        }
    }

    function makeBombs() {
        let num = getSquare(mp.x, mp.y);//(mp.y*(squaresWidth-1))+mp.x;
        for (let i = 0; i < squares.length; i++) {
            if (num == i) continue;
            let square = squares[i];
            if (rand(7) == 1) {
                square.danger = -1;
                bombAmount++;
            }
        }
    }

    function rand(x) {
        return Math.floor(Math.random() * x);
    }

    function uncoverZeros(square) {
        if (square == null || square.clicked) return;
        square.clicked = true;
        if (square.danger != 0) return;
        uncoverZeros(getSquare(square.x, square.y-1));
        uncoverZeros(getSquare(square.x, square.y+1));
        uncoverZeros(getSquare(square.x+1, square.y));
        uncoverZeros(getSquare(square.x-1, square.y));
        uncoverZeros(getSquare(square.x+1, square.y+1));
        uncoverZeros(getSquare(square.x-1, square.y+1));
        uncoverZeros(getSquare(square.x+1, square.y-1));
        uncoverZeros(getSquare(square.x-1, square.y-1));
    }

    function getSquare(x, y) {
        let num = (x*(squaresHeight))+y;
        let square = squares[num];
        return square;
    }

    function checkBomb(square) {
        if (square.danger == -1) {
            gameState = 0;
            renderSquares();
            gameOver();
        }
    }

    function checkBombs() {
        let bombs = bombAmount;
        squares.forEach((square) => {
            if (square.flagged) {
                if (square.danger != -1) return;
                bombs--;
            }
        });
        if (bombs == 0) {
            gameState = 2;
        }
    }

    function cheat() {
        if (!canCheat) return;
        squares.forEach((square) => {
            square.clicked = true;
        })
    }

    canvas.addEventListener("contextmenu", (e) => {
        if (gameState == 0) return;
        e.preventDefault();
        renderSquares();
        let square = squares[((mp.x-1)*squaresWidth)+(mp.y-1)];
        square.flagged = !square.flagged;
        checkBombs();
    });

    document.addEventListener("keypress", (e) => {
        let k = event.which || event.keyCode;
        let key = String.fromCharCode(k);
        if (key == "l") {
            cheat();
        }
    })

    canvas.addEventListener("mousedown", (e) => {
        if (gameState == 0) return;
        if (!getLeftClicked(e)) return;
        renderSquares();
        if (!clicked) {
            clicked = true;
            makeBombs();
            createSquares();
        }
        let square = squares[((mp.x-1)*squaresWidth)+(mp.y-1)];
        if (square.danger == 0) {
            uncoverZeros(square);
        }
        square.clicked = true;
        square.flagged = false;
        checkBomb(square);
    });

    function getLeftClicked(e) {
        let evt = e || window.event;
        if ("buttons" in evt) return evt.buttons == 1;
        var button = evt.which || evt.button;
        return button == 1;
    }
});
