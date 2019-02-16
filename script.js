$(document).ready(() => {
  const WIDTH = 500;
  const HEIGHT = 500;
  var canvas = $("<canvas></canvas>")
  $(canvas).attr("width", WIDTH);
  $(canvas).attr("height", HEIGHT);
  $(canvas).css("border", "10px solid black");
  $(canvas).css("border-radius", "15px");
  $("#canvasHere").append($(canvas));
  var ctx = $(canvas)[0].getContext("2d");
  var mousePos = {x: 0, y: 0};
  var mp = {x: 0, y: 0};
  var squares = [];
  var squaresHeight, squaresWidth = 20;
  var firstClick;
  var w, h;
  var gameState = 1;
  var bombAmount = 0;
  var canCheat = true;

  start();

  function start() {
    squares = JSON.parse(localStorage.getItem('squares')) || [];
    squaresWidth = localStorage.getItem('width') || 20;
    squaresHeight = localStorage.getItem('height') || 20;
    firstClick = localStorage.getItem('firstClick') || false
    w = WIDTH / squaresWidth;
    h = HEIGHT / squaresHeight;
    if (squares.length == 0) {
      makeSquares();
    }
  }

  const img = new Image(100, 100);
  img.src = 'bomb.png';

  function getMousePos(e) {
    let rect = $(canvas)[0].getBoundingClientRect();
    mousePos.x = e.clientX - rect.left - 10;
    mousePos.y = e.clientY - rect.top - 10;
    mp = {
      x: Math.floor(mousePos.x * squaresWidth / WIDTH),
      y: Math.floor(mousePos.y * squaresHeight / HEIGHT)
    };
    return mousePos;
  }

  $(canvas).mousemove((e) => {
    getMousePos(e);
  });

  var interv = setInterval(() => {
    renderSquares();
  }, 1);

  function renderSquares() {
    let num = getSquareNum(mp.x, mp.y);

    squares.forEach((square) => {
      let x = square.x;
      let y = square.y;
      let squarenum = getSquareNum(x, y);
      ctx.beginPath();
      ctx.rect(x * w, y * h, w, h);
      ctx.fillStyle = '#a6a6a6';
      if (square.clicked) ctx.fillStyle = 'lightgrey';
      if (squarenum == num) ctx.fillStyle = 'grey';
      if (square.flagged) ctx.fillStyle = 'red';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.stroke();
      if (square.clicked) {
        drawDangerText(square.danger, x * w, y * h);
      }
    });
    if (gameState == 0) {
      ctx.fillStyle = "red";
      ctx.font = 'italic 50pt Arial';
      ctx.fillText("Game Over!", (WIDTH / 2) - WIDTH / 3, (HEIGHT / 2));
    }
    if (gameState == 2) {
      ctx.fillStyle = "green";
      ctx.font = 'italic 50pt Arial';
      ctx.fillText("You Win!", (WIDTH / 2) - WIDTH / 3, (HEIGHT / 2));
    }
  }

  function gameOver() {
    if (gameState != 0) return;
    canCheat = true;
    cheat();
  }

  function drawDangerText(d, x, y) {
    let color = "";
    if (d == -1) {
      ctx.drawImage(img, x, y, w, h)
      return;
    }
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
    ctx.font = 'italic ' + h + 'px Monaco';
    ctx.fillText(d, x + (w / 6), y + (7 * h / 8));
  }

  function makeSquares() {
    squares = []
    for (let x = 0; x < squaresWidth; x++) {
      for (let y = 0; y < squaresHeight; y++) {
        ctx.beginPath();
        ctx.rect(x * w, y * h, w, h);
        ctx.fillStyle = 'lightgrey';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
        squares.push({
          clicked: false,
          danger: 0,
          x,
          y,
          flagged: false
        });
      }
    }
  }

  function createSquares() {
    for (let x = 0; x < squaresWidth; x++) {
      for (let y = 0; y < squaresHeight; y++) {
        let num = (x * squaresWidth) + y;
        let square = squares[num];
        if (square.danger == -1) {
          if (square.y > 0) {
            ifBomb(x - 1, y - 1);
            ifBomb(x + 1, y - 1);
            ifBomb(x, y - 1);
          }
          if (square.y < squaresHeight - 1) {
            ifBomb(x - 1, y + 1);
            ifBomb(x, y + 1);
            ifBomb(x + 1, y + 1);
          }
          ifBomb(x - 1, y);
          ifBomb(x + 1, y);
        }
      }
    }
  }

  function ifBomb(x, y) {
    let square = getSquare(x, y)
    if (square != null) {
      if (square.danger != -1) {
        square.danger += 1;
      }
    }
  }

  function isSquareNextToSquare(x1, y1, x2, y2) {
    if (Math.abs(x1-x2) < 2) {
      if (Math.abs(y1-y2) < 2) {
        return true;
      }
    }
    return false;
  }

  function makeBombs() {
    let num = getSquareNum(mp.x, mp.y);
    for (let i = 0; i < squares.length; i++) {
      let square = squares[i];
      if (isSquareNextToSquare(mp.x, mp.y, square.x, square.y)) continue;
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

    if (square.y > 0) {
      uncoverZeros(getSquare(square.x, square.y - 1));
      uncoverZeros(getSquare(square.x + 1, square.y - 1));
      uncoverZeros(getSquare(square.x - 1, square.y - 1));
    }

    if (square.y < squaresHeight - 1) {
      uncoverZeros(getSquare(square.x + 1, square.y + 1));
      uncoverZeros(getSquare(square.x - 1, square.y + 1));
      uncoverZeros(getSquare(square.x, square.y + 1));
    }

    uncoverZeros(getSquare(square.x + 1, square.y));
    uncoverZeros(getSquare(square.x - 1, square.y));


  }

  function getSquare(x, y) {
    let num = getSquareNum(x, y)
    let square = squares[num];
    return square;
  }

  function getSquareNum(x, y) {
    return (x * squaresHeight) + y
  }

  function checkBomb(square) {
    if (square.danger == -1) {
      gameState = 0;
      gameOver();
    }
  }

  function checkWin() {
    var win = true;
    squares.forEach((square) => {
      if (!square.clicked && square.danger != -1) {
        win = false;
        return;
      }
      if (square.danger == -1 && !square.flagged) {
        win = false;
        return;
      }
    });
    if (win) gameState = 2;
  }

  function cheat() {
    if (!canCheat) return;
    squares.forEach((square) => {
      square.clicked = true;
    })
  }

  function rClick() {
    testGenerate();
    if (gameState == 0) return;
    let square = getSquare(mp.x, mp.y);
    square.flagged = !square.flagged;
    checkWin();
  }

  function testGenerate() {
    if (!firstClick) {
      firstClick = true;
      generate();
    }
  }

  function generate() {
    makeBombs();
    createSquares();
  }

  function lClick() {
    testGenerate();
    let square = getSquare(mp.x, mp.y);
    if (square.danger == 0) {
      uncoverZeros(square);
    }
    square.clicked = true;
    square.flagged = false;
    checkBomb(square);
    checkWin();
  }

  $(canvas).contextmenu((e) => {
    e.preventDefault();
  });

  $(document).keypress((e) => {
    let k = event.which || event.keyCode;
    let key = String.fromCharCode(k);
    if (key == "l") {
      cheat();
    }
  })

  $(canvas).mousedown((e) => {
    if (gameState == 0) return;
    let clickNum = getClickNum(e).button;
    let shiftKey = getClickNum(e).shiftKey;
    if (clickNum == 0 && !shiftKey) {
      lClick();
    } else if (clickNum == 2 || (clickNum == 0 && shiftKey)) {
      rClick();
    }
    setStorage();
  });

  function setStorage() {
    localStorage.setItem("squares", JSON.stringify(squares));
    localStorage.setItem("width", squaresWidth);
    localStorage.setItem("height", squaresHeight);
    localStorage.setItem("firstClick", firstClick);
  }

  function getClickNum(e) {
    let evt = e || window.event;
    return evt;
  }

  const scale = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  function restart() {
    w = WIDTH / squaresWidth;
    h = HEIGHT / squaresHeight;
    makeSquares();
    firstClick = false;
    gameState = 1;
    setStorage();
  }

  $("#restart").click(restart)
  $("#rows").change(function () {
    squaresHeight = $(this).val();
    restart();
  })
  $("#columns").change(function () {
    squaresWidth = $(this).val();
    restart();
  })
});
