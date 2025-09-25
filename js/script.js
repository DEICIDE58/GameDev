const game = document.getElementById("game");
const world = document.getElementById("world");
const player = document.getElementById("player");
const guards = document.querySelectorAll(".guard");
const scoreBoard = document.getElementById("scoreBoard");

let playerX = 180, playerY = 560;
const step = 20;
let score = 0;
let lastLineCrossed = Math.floor(playerY / 100);
let gameRunning = false;
let guardAnimation;

// -------- INIT --------
function initGame() {
  updatePlayerPosition();
  console.log("Game ready. Press Start!");
}

// -------- START --------
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  scoreBoard.textContent = "Score: 0";
  playerX = 180; playerY = 560;
  updatePlayerPosition();

  // make the game zoom in bigger
  game.classList.add("zoomed");
  moveGuards();
}


// -------- PLAYER MOVEMENT --------
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;

  if (e.key === "ArrowUp" && playerY > 0) playerY -= step;
  if (e.key === "ArrowDown" && playerY < world.offsetHeight - player.offsetHeight) playerY += step;
  if (e.key === "ArrowLeft" && playerX > 0) playerX -= step;
  if (e.key === "ArrowRight" && playerX < game.offsetWidth - player.offsetWidth) playerX += step;

  updatePlayerPosition();
  checkCollision();
  checkWin();
});

// -------- UPDATE PLAYER --------
function updatePlayerPosition() {
  player.style.left = playerX + "px";
  player.style.top = playerY + "px";
  updateCamera();
  updateScore();
}

// -------- CAMERA --------
function updateCamera() {
  let offset = playerY - 120;
  if (offset < 0) offset = 0;

  // prevent camera from cutting off bottom
  if (offset > world.offsetHeight - game.offsetHeight - 40) {
    offset = world.offsetHeight - game.offsetHeight - 40;
  }

  world.style.transform = `translateY(-${offset}px)`;
}


// -------- SCORE --------
function updateScore() {
  let currentLine = Math.floor(playerY / 100);
  if (currentLine < lastLineCrossed) {
    score++;
    scoreBoard.textContent = "Score: " + score;
    lastLineCrossed = currentLine;
  }
}

// -------- GUARDS --------
const guardDirections = [2, -2, 2, -2, 2];

function moveGuards() {
  if (!gameRunning) return;
  guards.forEach((guard, index) => {
    let gX = parseInt(guard.style.left);

    if (gX >= game.offsetWidth - guard.offsetWidth || gX <= 0) {
      guardDirections[index] *= -1;
    }

    guard.style.left = gX + guardDirections[index] + "px";
  });

  checkCollision();
  guardAnimation = requestAnimationFrame(moveGuards);
}

// -------- COLLISION --------
function checkCollision() {
  const playerWidth = player.offsetWidth;
  const playerHeight = player.offsetHeight;

  
  player.style.outline = "1px solid blue";   

  guards.forEach(guard => {
    let gX = parseInt(guard.style.left);
    let gY = parseInt(guard.style.top);
    let gW = guard.offsetWidth;
    let gH = guard.offsetHeight;

    // Shrink hitbox for better gameplay
    let shrinkX = 6;   // small trim left/right
    let shrinkY = 3;   // small trim top/bottom

    // Debug: show guard hitbox
    //guard.style.outline = "1px solid red";  

    if (!(playerX + playerWidth - shrinkX < gX + shrinkX ||
          playerX + shrinkX > gX + gW - shrinkX ||
          playerY + playerHeight - shrinkY < gY + shrinkY ||
          playerY + shrinkY > gY + gH - shrinkY)) {

      alert("You got tagged! Game Over ❌\nFinal Score: " + score);
      window.location.reload();
    }
  });
}


// -------- WIN --------
function checkWin() {
  if (playerY <= 10) {
    alert("You Win! 🎉\nFinal Score: " + score);
    window.location.reload();
  }
}
