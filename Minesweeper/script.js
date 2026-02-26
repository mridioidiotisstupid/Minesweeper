const rows = 10;
const cols = 10;
const mineCount = 15;

let board = [];
let gameOver = false;

const boardElement = document.getElementById("board");

init();

function init() {
  boardElement.style.gridTemplateColumns = `repeat(${cols}, 35px)`;

  createBoardData();
  placeMines();
  calculateNumbers();
  renderBoard();
}

function createBoardData() {
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = {
        mine: false,
        revealed: false,
        neighborMines: 0,
      };
    }
  }
}

function placeMines() {
  let placed = 0;

  while (placed < mineCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);

    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
}

function calculateNumbers() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;

      let count = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr;
          let nc = c + dc;

          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            board[nr][nc].mine
          ) {
            count++;
          }
        }
      }

      board[r][c].neighborMines = count;
    }
  }
}

function renderBoard() {
  boardElement.innerHTML = "";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      cell.addEventListener("click", () => handleClick(r, c));

      boardElement.appendChild(cell);
    }
  }
}

function handleClick(r, c) {
  if (gameOver) return;
  if (board[r][c].revealed) return;

  revealCell(r, c);
  updateBoard();

  if (board[r][c].mine) {
    gameOver = true;
    alert("Game Over!");
  }
}

function revealCell(r, c) {
  if (
    r < 0 ||
    r >= rows ||
    c < 0 ||
    c >= cols ||
    board[r][c].revealed
  ) {
    return;
  }

  board[r][c].revealed = true;

  if (board[r][c].neighborMines === 0 && !board[r][c].mine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        revealCell(r + dr, c + dc);
      }
    }
  }
}

function updateBoard() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell, index) => {
    let r = Math.floor(index / cols);
    let c = index % cols;

    if (board[r][c].revealed) {
      cell.classList.add("revealed");

      if (board[r][c].mine) {
        cell.classList.add("mine");
        cell.textContent = "💣";
      } else if (board[r][c].neighborMines > 0) {
        cell.textContent = board[r][c].neighborMines;
      }
    }
  });
}