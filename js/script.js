// -------- DOM ELEMENTS --------
const game = document.getElementById("game");
const world = document.getElementById("world");
const player = document.getElementById("player");
const guards = document.querySelectorAll(".guard");
const scoreBoard = document.getElementById("scoreBoard");

// -------- CONFIGURATION --------
const step = 20;               // Player movement
const lineSpacing = 150;       // Distance between lines
const totalLines = 5;          // Number of lines
const guardDirections = [2, -2, 2, -2, 2]; // Guard movement speeds

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
  playerY = 790; 
  lastLineCrossed = totalLines + 1;
  score = 0;
  goingUp = true;
  checkpointReached = false;
  scoreBoard.textContent = "Score: 0";
  updatePlayerPosition();
}

// -------- START GAME --------
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  playerX = 180;
  playerY = 790;
  lastLineCrossed = totalLines + 1;
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
    for (let i = totalLines; i >= 1; i--) {
      let lineTop = i * lineSpacing;
      if (playerY <= lineTop && lastLineCrossed > i) {
        score++;
        scoreBoard.textContent = "Score: " + score;
        lastLineCrossed = i;
      }
    }
    if (playerY <= 50) {
      checkpointReached = true;
      goingUp = false;
      lastLineCrossed = 0;
    }
  } else {
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
  const pW = player.offsetWidth;
  const pH = player.offsetHeight;

  guards.forEach(guard => {
    const gX = parseInt(guard.style.left);
    const gY = parseInt(guard.style.top);
    const gW = guard.offsetWidth;
    const gH = guard.offsetHeight;

    const shrinkX = 6, shrinkY = -2;

    if (!(playerX + pW - shrinkX < gX + shrinkX ||
          playerX + shrinkX > gX + gW - shrinkX ||
          playerY + pH - shrinkY < gY + shrinkY ||
          playerY + shrinkY > gY + gH - shrinkY)) {
      endGame("❌ You got tagged! Game Over.");
    }
  });
}

// -------- WIN CONDITION --------
function checkWin() {
  if (!goingUp && checkpointReached && playerY >= 790) {
    endGame("🎉 You Win!");
  }
}

// -------- END GAME --------
function endGame(message) {
  gameRunning = false;
  cancelAnimationFrame(guardAnimation);
  document.getElementById("overlayMessage").textContent = message + ` Final Score: ${score}`;
  document.getElementById("overlay").classList.remove("hidden");
}

// -------- RESTART --------
function restartGame() {
  document.getElementById("overlay").classList.add("hidden");
  initGame();
  startGame();
}
