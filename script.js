// script.js
// This file contains the basic game logic for Water Quest

// Get references to HTML elements
var startScreen = document.getElementById('start-screen');
var instructionsScreen = document.getElementById('instructions-screen');
var gameScreen = document.getElementById('game-screen');
var endScreen = document.getElementById('end-screen');
var scoreDisplay = document.getElementById('score');
var finalScore = document.getElementById('final-score');
var player = document.getElementById('player');
var waterDrop = document.querySelector('.water-drop');
var obstacle = document.querySelector('.obstacle');
var pollution = document.querySelector('.pollution');
var village = document.getElementById('village');
var startBtn = document.getElementById('start-btn');
var instructionsBtn = document.getElementById('instructions-btn');
var backBtn = document.getElementById('back-btn');
var playAgainBtn = document.getElementById('play-again-btn');
// Add reference for reset button
var resetBtn = document.getElementById('reset-btn');

// Add confetti container
var confettiDiv = document.createElement('div');
confettiDiv.className = 'confetti';
document.body.appendChild(confettiDiv);

// Game variables
var score = 0;
var playerPos = { left: 10, top: 135 };
var gameActive = false;

// Variables for moving obstacle
var obstacleDirection = 1; // 1 means right, -1 means left
var obstacleSpeed = 2; // pixels per frame
var obstacleInterval;

// Variables for moving pollution obstacle
var pollutionDirection = 1;
var pollutionSpeed = 1.5;
var pollutionInterval;

// Variables for moving third obstacle
var obstacle3 = document.querySelector('.obstacle3');
var obstacle3Direction = 1;
var obstacle3Speed = 2;
var obstacle3Interval;

// Timer variables
var timerDisplay = document.getElementById('timer');
var dropTime = 10; // seconds
var dropTimer;

// Show instructions
instructionsBtn.onclick = function() {
    startScreen.style.display = 'none';
    instructionsScreen.style.display = 'block';
};

// Back to start
backBtn.onclick = function() {
    instructionsScreen.style.display = 'none';
    startScreen.style.display = 'block';
};

// Start the game
startBtn.onclick = function() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resetGame();
    gameActive = true;
    startObstacleMovement();
    confettiDiv.innerHTML = '';
    startDropTimer();
};

// Play again
playAgainBtn.onclick = function() {
    endScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resetGame();
    gameActive = true;
    startObstacleMovement();
    confettiDiv.innerHTML = '';
    startDropTimer();
};

// Reset game variables and positions
function resetGame() {
    score = 0;
    scoreDisplay.textContent = 'Water Drops: ' + score;
    playerPos = { left: 10, top: 135 };
    player.style.left = playerPos.left + 'px';
    player.style.top = playerPos.top + 'px';
    waterDrop.style.left = '180px';
    waterDrop.style.top = '100px';
    obstacle.style.left = '250px';
    obstacle.style.top = '180px';
    pollution.style.left = '100px';
    pollution.style.top = '40px';
    obstacle3.style.left = '180px';
    obstacle3.style.top = '120px';
    obstacle3.style.display = 'none';
    // Show cans again
    cans.forEach(function(can) {
        can.style.display = 'block';
    });
    stopObstacleMovement();
    stopDropTimer();
    timerDisplay.textContent = 'Time left: ' + dropTime;
    updateObstacles();
}

// Add click event listeners to cans for collecting points
var cans = document.querySelectorAll('.can');
cans.forEach(function(can) {
    can.onclick = function() {
        // Hide the can when clicked
        can.style.display = 'none';
        // Add points
        score += 2;
        // Change score color for feedback
        scoreDisplay.style.color = '#ffd600'; // charity: water yellow
        scoreDisplay.textContent = 'Water Drops: ' + score;
        // Return color to normal after a short time
        setTimeout(function() {
            scoreDisplay.style.color = '#0288d1';
        }, 300);
        updateObstacles();
    };
});

// Listen for arrow key presses
window.addEventListener('keydown', function(e) {
    if (!gameActive) return;
    var step = 10;
    if (e.key === 'ArrowUp') playerPos.top -= step;
    if (e.key === 'ArrowDown') playerPos.top += step;
    if (e.key === 'ArrowLeft') playerPos.left -= step;
    if (e.key === 'ArrowRight') playerPos.left += step;
    // Keep player inside game area
    if (playerPos.left < 0) playerPos.left = 0;
    if (playerPos.left > 370) playerPos.left = 370;
    if (playerPos.top < 0) playerPos.top = 0;
    if (playerPos.top > 270) playerPos.top = 270;
    player.style.left = playerPos.left + 'px';
    player.style.top = playerPos.top + 'px';
    checkCollision();
});

// Check for collisions with water drop, obstacle, or village
function checkCollision() {
    // Helper to get position and size
    function getRect(el) {
        return el.getBoundingClientRect();
    }
    var playerRect = getRect(player);
    var dropRect = getRect(waterDrop);
    var obstacleRect = getRect(obstacle);
    var pollutionRect = pollution.getBoundingClientRect();
    var obstacle3Rect = obstacle3.getBoundingClientRect();
    var villageRect = getRect(village);
    // Check water drop
    if (isColliding(playerRect, dropRect)) {
        score += 1;
        scoreDisplay.textContent = 'Water Drops: ' + score;
        // Move water drop to a new random position
        var newLeft = Math.floor(Math.random() * 350);
        var newTop = Math.floor(Math.random() * 250);
        waterDrop.style.left = newLeft + 'px';
        waterDrop.style.top = newTop + 'px';
        // Reset timer
        startDropTimer();
    }
    // Check trash obstacle
    if (isColliding(playerRect, obstacleRect)) {
        // Reduce score by 1, but not below 0
        score = Math.max(0, score - 1);
        scoreDisplay.textContent = 'Water Drops: ' + score;
        // Briefly flash score red
        scoreDisplay.style.color = 'red';
        setTimeout(function() {
            scoreDisplay.style.color = '#0288d1';
        }, 300);
        // Move player back to start
        playerPos = { left: 10, top: 135 };
        player.style.left = playerPos.left + 'px';
        player.style.top = playerPos.top + 'px';
    }
    // Check pollution obstacle
    if (isColliding(playerRect, pollutionRect)) {
        // Reduce score by 1, but not below 0
        score = Math.max(0, score - 1);
        scoreDisplay.textContent = 'Water Drops: ' + score;
        // Briefly flash score blue
        scoreDisplay.style.color = '#00bcd4';
        setTimeout(function() {
            scoreDisplay.style.color = '#0288d1';
        }, 300);
        // Move player back to start
        playerPos = { left: 10, top: 135 };
        player.style.left = playerPos.left + 'px';
        player.style.top = playerPos.top + 'px';
    }
    // Check third obstacle
    if (obstacle3.style.display !== 'none' && isColliding(playerRect, obstacle3Rect)) {
        // Reduce score by 1, but not below 0
        score = Math.max(0, score - 1);
        scoreDisplay.textContent = 'Water Drops: ' + score;
        // Briefly flash score red
        scoreDisplay.style.color = 'red';
        setTimeout(function() {
            scoreDisplay.style.color = '#0288d1';
        }, 300);
        // Move player back to start
        playerPos = { left: 10, top: 135 };
        player.style.left = playerPos.left + 'px';
        player.style.top = playerPos.top + 'px';
    }
    // Check village (goal)
    if (isColliding(playerRect, villageRect)) {
        endGame(true);
    }
}

// Simple collision detection
function isColliding(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// End the game
function endGame(won) {
    gameActive = false;
    gameScreen.style.display = 'none';
    endScreen.style.display = 'block';
    stopObstacleMovement();
    stopDropTimer();
    if (won) {
        finalScore.textContent = 'Water Drops Collected: ' + score;
        showConfetti();
    } else {
        finalScore.textContent = 'Game Over! Water Drops: ' + score + ' (Time ran out or you hit trash)';
        confettiDiv.innerHTML = '';
    }
}

// Simple confetti effect
function showConfetti() {
    confettiDiv.innerHTML = '';
    for (var i = 0; i < 30; i++) {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = ['#ffd600','#00bcd4','#fff'][Math.floor(Math.random()*3)];
        piece.style.animationDelay = (Math.random()*0.5) + 's';
        confettiDiv.appendChild(piece);
    }
    setTimeout(function() {
        confettiDiv.innerHTML = '';
    }, 2000);
}

// Reset button functionality
resetBtn.onclick = function() {
    endScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resetGame();
    gameActive = true;
    startObstacleMovement();
    confettiDiv.innerHTML = '';
    startDropTimer();
};

// Start moving the obstacles when the game starts
function startObstacleMovement() {
    clearInterval(obstacleInterval);
    clearInterval(pollutionInterval);
    clearInterval(obstacle3Interval);
    obstacleInterval = setInterval(function() {
        var left = parseInt(obstacle.style.left);
        left += obstacleSpeed * obstacleDirection;
        if (left > 350) {
            obstacleDirection = -1;
            left = 350;
        }
        if (left < 0) {
            obstacleDirection = 1;
            left = 0;
        }
        obstacle.style.left = left + 'px';
    }, 20); // Move every 20ms
    // Move pollution obstacle
    pollutionInterval = setInterval(function() {
        var left = parseInt(pollution.style.left);
        left += pollutionSpeed * pollutionDirection;
        if (left > 350) {
            pollutionDirection = -1;
            left = 350;
        }
        if (left < 0) {
            pollutionDirection = 1;
            left = 0;
        }
        pollution.style.left = left + 'px';
    }, 20);
    // Only move obstacle3 if visible
    if (obstacle3.style.display !== 'none') {
        obstacle3Interval = setInterval(function() {
            var left = parseInt(obstacle3.style.left);
            left += obstacle3Speed * obstacle3Direction;
            if (left > 350) {
                obstacle3Direction = -1;
                left = 350;
            }
            if (left < 0) {
                obstacle3Direction = 1;
                left = 0;
            }
            obstacle3.style.left = left + 'px';
        }, 20);
    }
}

// Stop obstacle movement
function stopObstacleMovement() {
    clearInterval(obstacleInterval);
    clearInterval(pollutionInterval);
    clearInterval(obstacle3Interval);
}

// Start the timer for the water drop
function startDropTimer() {
    clearInterval(dropTimer);
    var timeLeft = dropTime;
    timerDisplay.textContent = 'Time left: ' + timeLeft;
    dropTimer = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = 'Time left: ' + timeLeft;
        if (timeLeft <= 0) {
            // If time runs out, player loses
            endGame(false);
        }
    }, 1000);
}

// Stop the drop timer
function stopDropTimer() {
    clearInterval(dropTimer);
}

// Update score and unlocks
function updateObstacles() {
    // If score >= 10, make obstacles move faster
    if (score >= 10) {
        obstacleSpeed = 4;
        pollutionSpeed = 3;
    } else {
        obstacleSpeed = 2;
        pollutionSpeed = 1.5;
    }
    // If score >= 20, show and move third obstacle
    if (score >= 20) {
        obstacle3.style.display = 'block';
        // Start moving third obstacle if not already
        if (!obstacle3Interval) {
            obstacle3Interval = setInterval(function() {
                var left = parseInt(obstacle3.style.left);
                left += obstacle3Speed * obstacle3Direction;
                if (left > 350) {
                    obstacle3Direction = -1;
                    left = 350;
                }
                if (left < 0) {
                    obstacle3Direction = 1;
                    left = 0;
                }
                obstacle3.style.left = left + 'px';
            }, 20);
        }
    } else {
        obstacle3.style.display = 'none';
        clearInterval(obstacle3Interval);
        obstacle3Interval = null;
    }
}