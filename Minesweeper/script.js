const rows = 5;
const cols = 5;
const mineCount = 1;

let multiplierCount = 3;

let minesLeft;
var score = 0;
var highScore = 0;

var gold;


var scoreMultiplier = 3;
var scoreIncrease = 50;

let board = [];
let gameOver = false;



const boardElement = document.getElementById("board");

const restartButton = document.getElementById("restartButton");





init();


//iniates everything
function init() {

  
  boardElement.style.gridTemplateColumns = `repeat(${cols}, 35px)`;

  createBoardData();
  placeMines();
  placeScoreMult();
  calculateNumbers();
  renderBoard();
  UpdateScore();
  updateBoard();
  minesLeft = mineCount;
}


//creates a empty 2d board
function createBoardData() {
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = {
        //gives each cell attributes, that is by default set to the lowest or false. the same as creating a class in c#, but here you can just make variables and it will
        //identify itself based on the data given.
        mine: false,
        multiplier: false,
        flag: false,
        revealed: false,
        neighborMines: 0,
      };
    }
  }
}


//randomly places mines on the board
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
//places multipliers around the board. a mine cannot be a multiplier.
function placeScoreMult()
{
  let placed = 0;
//Places multiplier
  while (placed < multiplierCount)
  {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
//checks that the randomly selected cell is not already a multiplier or mine.
    if (board[r][c].mine || board[r][c].multiplier) continue;

    let canPlace = true;
    //failed attempt at making it so multipliers cannot be placed inside a 3x3 radius of each other.
    //it didnt work, but i will let the code stay here.
    for (let dr = -1; dr <= 1 && canPlace; dr++)
    {
      for (let dc = -1; dc <= 1 && canPlace; dc++)
      {
        if (dr === 0 && dc === 0) continue;
        let nr = r + dr;
        let nc = c + dc;
        if (nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            !board[nr][nc].multiplier)
            {
              canPlace = true;
            }
            else {
              canPlace = false;
            }
      }
    }
    //places it and increased placed, which controls the while loop. when all 3 multipliers have been placed this function
    //will stop running
    if(canPlace)
    {
      board[r][c].multiplier = true;
      placed++;
      console.log(r,c);
    }
  }
}
 
//calculate each cells number based on how many mines are surrounding it in a 3x3 radius.
function calculateNumbers() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      //skips the cell if it is a mine. if we had used return here it would stop the whole loop but since we use continue it only skips the cells that are mines.
      if (board[r][c].mine) continue;

      let count = 0;
      //finds all the neighbours. since we are calculating [r][c], dr and dc let us find the ones surrounding [r][c]
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          // nr and nc stands for neighboring row and collumn.
          let nr = r + dr;
          let nc = c + dc;

          if (
            //checks that the cell is within boundaries. a index starts at zero, thats why the code include zero in its calculation.
            //what happens here is : if neighbour row is bigger than or equal to cell 0, and its less than the amount of rows there is (since the index starts at zero,
            //its not a <= because = would be one more than it normally is), and then the same with cols, AND if it is a mine, it will increase the count of [r][c], the cell
            //we are calculating on.
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
      //fills in the empty info that we created in createboardData. sets it to the amount of mines that neighbour the cell.
      board[r][c].neighborMines = count;
    }
  }
}


//until now, all we have done is just invisible internall data, and it wont be displayed in html. here we give it visualls and display our data
function renderBoard() {

  //sets the innerHTML to nothing so it always resets when we render board again. if not, the visualls would stack on top of each other when we reset the game.
  boardElement.innerHTML = "";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      //makes it a div so it sorts itself out within the board element
      const cell = document.createElement("div");
      //makes it off class cell so that it gets styled through the css, also makes it so we can update all cells at once in updateboard.
      cell.classList.add("cell");
//adds an event when its clicked, which is the handleclick function. makes each cell clickable.
      cell.addEventListener("click", () => handleClick(r, c));

      cell.addEventListener("contextmenu", (e) => {e.preventDefault(); placeFlag(r,c);})

    
//makes it so each time a cell is made, it is put as a child of the boardelement and placed furthest back.
      boardElement.appendChild(cell);
    }
  }
}


//handles click, exposes the cell clicked and update the visual board. also expose
function handleClick(r, c) {
  if (gameOver) return;
  if (board[r][c].revealed) return;
  if (board[r][c].flag) return;

  revealCell(r, c);
  updateBoard();

  if (board[r][c].mine) {
    
    GameOver();
  }
  if (board[r][c].multiplier) {

  }
}
//Freezes clicks when you press a mine
function GameOver()
{
  gameOver = true;
  restartButton.addEventListener("click", () => restartGame());
showRestartBtn();
}
//gives you gold when you have flagged all mines
function GameWon()
{
  showRestartBtn();
  IncreaseGold(score);
}
//restarts the board and other data so you can play again. you keep your highscore and gold.
function restartGame()
{
  board = [];
  gameOver = false;
  boardElement.innerHTML = "";
  hideRestartBtn();
  score = 0;

  init();

}
//makes the restartBtn visible and clickable
function showRestartBtn()
{
  restartButton.style.display = "block";
}
//hides the restartBtn and makes it unclickable
function hideRestartBtn()
{
  restartButton.style.display = "none";

}
//reveals clicked cell + reveals surounding cells if there are no mines in a 3x3 radius.
function revealCell(r, c) {
  if (
    //another boundary check and also checks if the cell has already been revealed.
    r < 0 ||
    r >= rows ||
    c < 0 ||
    c >= cols ||
    board[r][c].revealed
  ) return;
  

  board[r][c].revealed = true;
 

  
  if (board[r][c].neighborMines === 0 && !board[r][c].mine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr;
        let nc = c + dc;

        if(
          //checks that its not outside of bounds and makes it so multipliers dont get revealed
          //when multi revealing.
          nr >= 0 && nr < rows &&
          nc >= 0 && nc < cols && !board[nr][nc].multiplier
        ){
        revealCell(nr, nc);
        }
      }
    }
  }
  if (!board[r][c].multiplier) {
    IncreaseScore(board[r][c].neighborMines * scoreIncrease);
  }
  if (board[r][c].multiplier) {
    SetScore(score * scoreMultiplier); // bonus for multiplier
  } 

}


//to update the visual of each cell, we got to use a different approach than we can do with the internal javaS code that we have above.
function updateBoard() {
  //everything below happens inside of the HTML, which is why we have to do something completely different to get the same result as what we got above.
  const cells = document.querySelectorAll(".cell");

  //for each element inside of cells, which is all the visible cells on the website, the index number increase, so cell 0,0 would be index 0, and cell 0,1 would be index 1.
  //this is why we have to floor and %, because the numbers does not directly translate to its position inside of the board.
  cells.forEach((cell, index) => {
    let r = Math.floor(index / cols);
    let c = index % cols;

    if (board[r][c].revealed) {
      //adds the revealed class, so the CSS code's class is applied to the revealed cell.
      cell.classList.add("revealed");

      if (board[r][c].mine) {
        cell.classList.add("mine");
        cell.textContent = "💣";
      } 
      else if (board[r][c].multiplier) {
        cell.classList.add("multiplier");
        cell.textContent = "🤑";
      }
      //checks if it has any neighbouring mines, and if it does, it will display that number on the cell.
      else if (board[r][c].neighborMines > 0) {
        cell.textContent = board[r][c].neighborMines;
      }
    }
  });



  
}
//toggles flag, both removes and places flag.
function placeFlag (r, c) { 
  
    if(gameOver) return;
    if(board[r][c].revealed) return;
//grabs the DOM element that corresponse to the [r][c] position. lets think about this, if the position is [1][1], for it to correspond in the index, it needs to be 11,
//and it becomes 11 when we multiply r with cols, and add c. same thing, if the position is [0][5], 0*10 is zero so it gets the excact index number that corresponds to
// the cell we want to place a flag on
   let cellElement = document.querySelectorAll(".cell")[r * cols + c];


   //acts as a toggle. if it already is a flag, it will remove the flag, but if not, it will make it a flag.
if(cellElement.classList.contains("flag")) {
  cellElement.classList.remove("flag");
  cellElement.textContent = "";
  board[r][c].flag = false;

  if(board[r][c].mine) {
    minesLeft++;
    console.log("mines left: ", minesLeft)
  }
}
else {
  cellElement.classList.add("flag");
  cellElement.textContent = "🚩";
  board[r][c].flag = true;

  if(board[r][c].mine) {
    minesLeft--;
    console.log("mines left: ", minesLeft);
    if (minesLeft == 0)
    {
      GameWon();
    }
  }
}

    

  }
//increases Score
  function IncreaseScore(scoreIncrease)
  {
    score += scoreIncrease;
    
    UpdateScore();





  }
  //update Score visual.
  function UpdateScore()
  {
    if(score > highScore)
    {
      highScore = score;
      document.getElementById("highScore").textContent = highScore;
    }
    document.getElementById("score").textContent = score;


  }
  //sets score to a set value, overrides score.
  function SetScore(scoreValue)
  {
    score = scoreValue;
    UpdateScore();


  }
//same as score but for gold.
  function IncreaseGold(goldIncrease)
  {
    gold += goldIncrease;


  }
//same as score but for gold.
  function UpdateGold()
  {
    document.getElementById("gold").textContent = gold;

  }