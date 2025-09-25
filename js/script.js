// -------- DOM ELEMENTS --------
const game = document.getElementById("game");
const world = document.getElementById("world");
const player = document.getElementById("player");
const guards = document.querySelectorAll(".guard");
const scoreBoard = document.getElementById("scoreBoard");

// -------- CONFIGURATION --------
const step = 20;               // Player movement
const lineSpacing = 150;       // Distance between lines
const totalLines = 5;          // Number of lines up
const guardDirections = [2, -2, 2, -2, 2]; // Guard movement

// -------- GAME VARIABLES --------
let playerX = 180;
let playerY;
let score = 0;
let lastLineCrossed;
let gameRunning = false;
let goingUp = true; 
let checkpointReached = false;
let guardAnimation;

// -------- INIT --------
function initGame() {
  playerY = 790; // start at start/end zone
  lastLineCrossed = totalLines + 1; // above top line for upward trip
  score = 0;
  goingUp = true;
  checkpointReached = false;
  scoreBoard.textContent = "Score: 0";
  updatePlayerPosition();
  console.log("Game ready. Press Start!");
}

// -------- START GAME --------
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  playerX = 180;
  playerY = 790;
  lastLineCrossed = totalLines + 1; // reset for upward trip
  score = 0;
  goingUp = true;
  checkpointReached = false;
  updatePlayerPosition();

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
  let offset = playerY - game.offsetHeight / 2 + player.offsetHeight / 2;
  if (offset < 0) offset = 0;
  if (offset > world.offsetHeight - game.offsetHeight) offset = world.offsetHeight - game.offsetHeight;
  world.style.transform = `translateY(-${offset}px)`;
}

// -------- SCORE --------
function updateScore() {
  if (goingUp) {
    // Upward trip: score when passing each line
    for (let i = totalLines; i >= 1; i--) {
      let lineTop = i * lineSpacing;
      if (playerY <= lineTop && lastLineCrossed > i) {
        score++;
        scoreBoard.textContent = "Score: " + score;
        lastLineCrossed = i;
      }
    }

    // Checkpoint
    if (playerY <= 50) checkpointReached = true;

    // Top reached → start downward trip
    if (playerY <= 50) {
      goingUp = false;
      lastLineCrossed = 0; // reset for downward trip
    }

  } else {
    // Downward trip: only score if checkpoint reached
    if (checkpointReached) {
      for (let i = 1; i <= totalLines; i++) {
        let lineTop = i * lineSpacing;
        if (playerY >= lineTop && lastLineCrossed < i) {
          score++;
          scoreBoard.textContent = "Score: " + score;
          lastLineCrossed = i;
        }
      }
    }
  }
}

// -------- GUARD MOVEMENT --------
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

  guards.forEach(guard => {
    const gX = parseInt(guard.style.left);
    const gY = parseInt(guard.style.top);
    const gW = guard.offsetWidth;
    const gH = guard.offsetHeight;

    const shrinkX = 6;
    const shrinkY = 3;

    if (!(playerX + playerWidth - shrinkX < gX + shrinkX ||
          playerX + shrinkX > gX + gW - shrinkX ||
          playerY + playerHeight - shrinkY < gY + shrinkY ||
          playerY + shrinkY > gY + gH - shrinkY)) {

      alert(`You got tagged! Game Over ❌\nFinal Score: ${score}`);
      window.location.reload();
    }
  });
}

// -------- WIN CONDITION --------
function checkWin() {
  if (!goingUp && checkpointReached && playerY >= 790) {
    alert(`You Win! 🎉\nFinal Score: ${score}`);
    window.location.reload();
  }
}
