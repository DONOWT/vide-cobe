let cols = 10;
let rows = 10;
let cellSize = 40;
let grid;

let diceSize = 80;
let diceX = 420;
let diceY = 60;

let dice1, dice2;

let pieceACol = 5;
let pieceARow = 5;
let pieceBCol = 4;
let pieceBRow = 4;

let isPieceATurn = true;

// Track one special square per color
let specialSquares = {};

function setup() {
  createCanvas(600, 400);

  grid = new Array(cols);
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      let x = i * cellSize;
      let y = j * cellSize;

      let palette = [
        lerpColor(color(255, 0, 0), color(255), 0.5),
        lerpColor(color(255, 128, 0), color(255), 0.5),
        lerpColor(color(255, 255, 0), color(255), 0.5),
        lerpColor(color(0, 200, 0), color(255), 0.5),
        lerpColor(color(0, 0, 255), color(255), 0.5)
      ];

      let base = palette[int(random(palette.length))];
      let cString = base.toString(); // unique key for color

      // Assign one special square per color
      if (!specialSquares[cString]) {
        specialSquares[cString] = { col: i, row: j };
      }

      grid[i][j] = new Cell(x, y, cellSize, base, cString);
    }
  }

  dice1 = new Dice(diceX, diceY, diceSize);
  dice2 = new Dice(diceX, diceY + diceSize + 40, diceSize);
}

function draw() {
  background(255);

  // Draw grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].display();
    }
  }

  // Draw pieces
  drawPiece(pieceACol, pieceARow, color(0));
  drawPiece(pieceBCol, pieceBRow, color(255));

  // Draw dice
  dice1.display();
  dice2.display();

  fill(0);
  textSize(20);
  text(isPieceATurn ? "Piece A turn" : "Piece B turn", diceX, diceY - 20);
  text("Sum: " + (dice1.value + dice2.value), diceX, diceY + 2 * diceSize + 100);
}

function mousePressed() {
  // Dice roll area
  if (mouseX > 400) {
    dice1.roll();
    dice2.roll();
    let sum = dice1.value + dice2.value;

    resetAllColors();

    let activeCol = isPieceATurn ? pieceACol : pieceBCol;
    let activeRow = isPieceATurn ? pieceARow : pieceBRow;

    // Highlight reachable squares
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let dist = abs(i - activeCol) + abs(j - activeRow);
        if (dist === sum) {
          grid[i][j].highlight();
        }
      }
    }
  }

  // Grid click
  if (mouseX < cols * cellSize && mouseY < rows * cellSize) {
    let clickedCol = int(mouseX / cellSize);
    let clickedRow = int(mouseY / cellSize);

    if (grid[clickedCol][clickedRow].isHighlighted) {

      // Move piece
      if (isPieceATurn) {
        pieceACol = clickedCol;
        pieceARow = clickedRow;
      } else {
        pieceBCol = clickedCol;
        pieceBRow = clickedRow;
      }

      // Check if landing on a special square
      let landedColor = grid[clickedCol][clickedRow].colorKey;
      let special = specialSquares[landedColor];

      if (special.col === clickedCol && special.row === clickedRow) {
        activateColorGroup(landedColor);
      } else {
        resetAllColors();
      }

      isPieceATurn = !isPieceATurn;
    }
  }
}

function drawPiece(col, row, c) {
  let x = col * cellSize + cellSize / 2;
  let y = row * cellSize + cellSize / 2;
  fill(c);
  ellipse(x, y, cellSize * 0.6, cellSize * 0.6);
}

class Cell {
  constructor(x, y, size, baseColor, colorKey) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.baseColor = baseColor;
    this.currentColor = baseColor;
    this.colorKey = colorKey;
    this.isHighlighted = false;
  }

  highlight() {
    this.isHighlighted = true;
    this.currentColor = lerpColor(this.baseColor, color(128, 0, 128), 0.5);
  }

  resetColor() {
    this.isHighlighted = false;
    this.currentColor = this.baseColor;
  }

  display() {
    fill(this.currentColor);
    stroke(0);
    strokeWeight(1);
    rect(this.x, this.y, this.size, this.size);

    // Draw thick white border for special squares
    let special = specialSquares[this.colorKey];
    if (special.col === this.x / cellSize && special.row === this.y / cellSize) {
      stroke(255);
      strokeWeight(5);
      noFill();
      rect(this.x, this.y, this.size, this.size);
    }
  }
}

class Dice {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.value = 1;
  }

  roll() {
    this.value = int(random(1, 7));
  }

  display() {
    fill(255);
    stroke(0);
    rect(this.x, this.y, this.size, this.size, 10);
    this.drawDots();
  }

  drawDots() {
    fill(0);
    let r = this.size / 6;

    let cx = this.x + this.size / 2;
    let cy = this.y + this.size / 2;
    let left = this.x + this.size / 4;
    let right = this.x + (3 * this.size) / 4;
    let top = this.y + this.size / 4;
    let bottom = this.y + (3 * this.size) / 4;

    if ([1, 3, 5].includes(this.value)) ellipse(cx, cy, r, r);
    if (this.value >= 2) {
      ellipse(left, top, r, r);
      ellipse(right, bottom, r, r);
    }
    if (this.value >= 4) {
      ellipse(right, top, r, r);
      ellipse(left, bottom, r, r);
    }
    if (this.value === 6) {
      ellipse(left, cy, r, r);
      ellipse(right, cy, r, r);
    }
  }
}

function activateColorGroup(colorKey) {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].colorKey === colorKey) {
        grid[i][j].currentColor = color(0);
      }
    }
  }
}

function resetAllColors() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].resetColor();
    }
  }
}
