//Brick Breaker Pong game source file,
//Copyright © 2016 Maxx Marian <maxx.marian1@gmail.com>
//This work is free. You can redistribute it and/or modify it under the
//terms of the Do What The Fuck You Want To Public License, Version 2,
//    as published by Sam Hocevar. See the LICENCE file for more details.

var img;
function setup() {
    //calls functions to set up board, each players base, the paddles, and sides of the playing surface
    createCanvas(1200, 600);
    playerData();
    startScreen();
    //bases();
    //paddles();
    //walls();
    //ball();
    //hitCount();
}
function preload() {
    //only image needed is the ball's white circle
    img = loadImage('media/BallCircle.jpg');
}
function draw() {
    background(0);
    fill(255);
    drawSprites();
    collisionDetect();
    title();
    if (startScreen.finished) {
        movement();
        scoreBoard();
        checkForWinner();
    }
}
function ball() {
    //creates the ball for the first time. I used properties for a lot of stuff in this sketch because they can be
    //called from anywhere easily
    ball.firstBall = createSprite(600, 300, 30, 30);
    ball.firstBall.draw = function() { ellipse(0,0,28,28) };
    ball.firstBall.setCollider("circle",0,0,14);
    ball.firstBall.shapeColor="WHITE";
    //ball.firstBall.debug=true;
    ball.firstBall.setSpeed(getRandomInt(6, 9), getRandomInt(getRandomInt(140, 230), getRandomInt(60, 300)));
    //ball.firstBall.addImage(img);
}

function collisionDetect() {
    //uses bounce to check for collisions with all sprites, including both players bases and the paddles.
    //might have been able to use a forEach or something, but since i needed a different callback depending on what the
    //ball hit, i just called it for each thing individually.
    ball.firstBall.bounce(walls.topWall);
    ball.firstBall.bounce(walls.bottomWall);
    ball.firstBall.bounce(bases.player2Base, function (ball, sprite) {
        sprite.remove();
    });
    ball.firstBall.bounce(bases.player1Base, function (ball, sprite) {
        sprite.remove();
    });
    //when the ball bounces off the paddle, it teleports to the front, so that in case the collision detection doesn't work
    //correctly and it goes through the paddle, it is limited to only destroying one block in the base, rather than bouncing off the back of the paddle
    //and making that player lose (happened in testing).
    //It also adds a semi-random speed and angle to the ball to make it harder over time.
    ball.firstBall.bounce(paddles.player1, function (ball, sprite) {
        sprite.setSpeed(0, 90);
        ball.position.x = sprite.position.x + 30;
        ball.addSpeed(getRandomInt(1, 3), getRandomInt(320, 420));
        hitCount.player1+=1;
    });
    ball.firstBall.bounce(paddles.player2, function (ball, sprite) {
        sprite.setSpeed(0, 90);
        ball.position.x = sprite.position.x - 30;
        ball.addSpeed(getRandomInt(1, 3), getRandomInt(140, 230));
        hitCount.player2+=1;
    });
    //updating the ball's hitbox for increases in velocity
    ball.firstBall.setCollider("rectangle", 0, 0, ball.firstBall.velocity.x + ball.firstBall.collider.width, ball.firstBall.velocity.y + ball.firstBall.collider.height, 0);
    paddles.player1.collide(walls.bottomWall, function (paddle) {
        paddle.position.y = paddle.position.y - paddles.paddlespeed;
        paddle.setSpeed(0, 270);
    });
    paddles.player1.collide(walls.topWall, function (paddle) {
        paddle.position.y = paddle.position.y + paddles.paddlespeed;
        paddle.setSpeed(0, 270);
    });
    paddles.player2.collide(walls.bottomWall, function (paddle) {
        paddle.position.y = paddle.position.y - paddles.paddlespeed;
        paddle.setSpeed(0, 270);
    });
    paddles.player2.collide(walls.topWall, function (paddle) {
        paddle.position.y = paddle.position.y + paddles.paddlespeed;
        paddle.setSpeed(0, 270);
    });
}

function paddles() {
    paddles.paddlespeed = 10; //global paddle speed, which is fixed, but if i wanted to i could increase it with ball speed.
    var paddlesGroup = Group(); //created a group just for creation of sprites, i call it using the property paddles.playerX
    //in other parts of the sketch.
    paddles.player1 = createSprite(90, 360, 20, 100);
    paddles.player1.addToGroup(paddlesGroup);
    paddles.player2 = createSprite(1090, 360, 20, 100);
    paddles.player2.addToGroup(paddlesGroup);
    paddlesGroup.forEach(function (paddle) {
        paddle.shapeColor = "WHITE";
        paddle.immovable = true;
        //offsetting paddle hitboxes because p5 collision detection is sketchy.
        paddle.setCollider("rectangle", 12, 40, 20, 100);
    })

}
function movement() {
    //player1 paddle movement
    if (keyDown('W' || 'w')) {
        paddles.player1.setSpeed(paddles.paddlespeed, 270);
    }
    if (keyWentUp('W' || 'w')) {
        paddles.player1.setSpeed(0, 270);
    }
    if (keyDown('S' || 's')) {
        paddles.player1.setSpeed(paddles.paddlespeed, 90);
    }
    if (keyWentUp('S' || 's')) {
        paddles.player1.setSpeed(0, 90);
    }
    //player 2 paddle movement
    if (keyDown('UP')) {
        paddles.player2.setSpeed(paddles.paddlespeed, 270);
    }
    if (keyWentUp('UP')) {
        paddles.player2.setSpeed(0, 270);
    }
    if (keyDown('DOWN')) {
        paddles.player2.setSpeed(paddles.paddlespeed, 90);
    }
    if (keyWentUp('DOWN')) {
        paddles.player2.setSpeed(0, 90);
    }

}
function bases() {
    //each players base wall is a group of sprites
    var player1Base = Group();
    var player2Base = Group();
    //creating sprites for each player, with 14 per column, 3 columns per player using a big for loop.
    //might have been an easier way to do this, but i couldn't think of one off hand, and I didn't have time to
    //clean it up after all the fun I had with p5.play colliders
    for (i = 0; i <= 86; i++) {
        //player1
        if (i <= 14) {
            var player1Column0Sprite = createSprite(5, i * 50, 15, 45);
            player1Column0Sprite.addToGroup(player1Base);
        }
        if (i >= 14 && i <= 28) {
            var player1Column1Sprite = createSprite(25, (i - 15) * 50, 15, 45);
            player1Column1Sprite.addToGroup(player1Base);
        }
        if (i >= 28 && i <= 42) {
            var player1Column2Sprite = createSprite(45, (i - 30) * 50, 15, 45);
            player1Column2Sprite.addToGroup(player1Base);
        }

        //player2
        if (i >= 42 && i <= 56) {
            var player2Column0Sprite = createSprite(1180, (i - 42) * 50, 15, 45);
            player2Column0Sprite.addToGroup(player2Base);
        }
        if (i >= 56 && i <= 71) {
            var player2Column1Sprite = createSprite(1160, (i - 56) * 50, 15, 45);
            player2Column1Sprite.addToGroup(player2Base);
        }
        if (i >= 71) {
            var player2Column2Sprite = createSprite(1140, (i - 71) * 50, 15, 45);
            player2Column2Sprite.addToGroup(player2Base);
        }

    }
    //make each base group a property so it can be called from anywhere (hint: I hate globals)
    bases.player1Base = player1Base;
    bases.player2Base = player2Base;
    //use forEach to make the bases the right color and immovable
    bases.player1Base.forEach(function (sprite) {
        sprite.shapeColor = "BLUE";
        sprite.immovable = true;
    });
    bases.player2Base.forEach(function (sprite) {
        sprite.shapeColor = "RED";
        sprite.immovable = true;
    });
}
function walls() {
    //these are invisible sprites off screen that make the ball bounce off the top and bottom of the canvas.
    walls.topWall = createSprite(-50, -10, 13000, 10);
    walls.bottomWall = createSprite(-50, 600, 13000, 10);
    walls.topWall.immovable = true;
    walls.bottomWall.immovable = true;
}
function checkForWinner() {
    //a ball position based winner check, that has a popup with the winner and then starts a new game
    if (ball.firstBall.position.x < 0) {
        if (scoreBoard.player2Score > playerData.globalHighScore) {
            var highScoreHolder = prompt("Congratulations Player 2, you are the the winner and the new High Score Holder with a score of " + scoreBoard.player2Score + "! Please enter your name.");
            localStorage.highestScore = scoreBoard.player2Score;
            localStorage.highScoreHolder = highScoreHolder;
            startScreen()
        }
        if (scoreBoard.player2Score < playerData.globalHighScore) {
            confirm('Player 2 Wins, with a Score of ' + scoreBoard.player2Score + '!');
            startScreen();
        }
    }
    if (ball.firstBall.position.x > 1200) {
        if (scoreBoard.player1Score > playerData.globalHighScore) {
            var highScoreHolder = prompt("Congratulations Player 1, you are the winner and the new High Score Holder with a score of " + scoreBoard.player1Score + "! Please enter your name.");
            localStorage.highestScore = scoreBoard.player1Score;
            localStorage.highScoreHolder = highScoreHolder;
            startScreen();
        }
        if (scoreBoard.player1Score < playerData.globalHighScore) {
            confirm('Player 1 Wins, with a Score of ' + scoreBoard.player1Score + '!');
            startScreen();
        }
    }
}
function hitCount(){
    hitCount.player1=0;
     hitCount.player2=0;
}
function scoreBoard() {
    scoreBoard.player1Score=hitCount.player1-hitCount.player2;
    scoreBoard.player2Score=hitCount.player2-hitCount.player1;
    fill(255);
    textFont("Helvetica");
    textAlign(CENTER);
    textSize(20);
    text("Player 1's Score:", 400, 20);
    text("Player 2's Score:", 800, 20);
    textSize(25);
    text(scoreBoard.player1Score, 400, 55);
    text(scoreBoard.player2Score, 800, 55);
}
function newGame() {
    //starting a new game
    //I tried to use forEach here, but allSprites is not a real group, so it wont using sprite.remove on each element
    //doesn't work in a for each. had to do some jenky for loop code to make it work
    for (i = 0; i <= allSprites.length; i++) {
        allSprites.removeSprites();
    }
    bases();
    paddles();
    walls();
    ball();
    hitCount();
    playerData();
}
//lastly, just a simple random integer code with a defined bound.
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function playerData(){
    if (localStorage.highestScore !== undefined) {
        playerData.globalHighScore = parseInt(localStorage.highestScore);
    }
    else {
        playerData.globalHighScore = 0;
    }
}

function startScreen() {
    for (i = 0; i <= allSprites.length; i++) {
        allSprites.removeSprites();
    }
    startScreen.finished = false;
    title.buttonPressed=false;
    bases();
    paddles();
    walls();
    ball();
    hitCount();
    startScreen.startButton=createSprite(canvas.width/2-150,175,300,50);
    startScreen.startButton.shapeColor="WHITE";
    startScreen.startButton.mouseActive=true;
    startScreen.startButton.setCollider("rectangle", 150, 25, 300, 50);
    startScreen.instructionsButton=createSprite(canvas.width/2-150,275,300,50);
    startScreen.instructionsButton.shapeColor="WHITE";
    startScreen.instructionsButton.mouseActive = true;
    startScreen.instructionsButton.setCollider("rectangle", 150, 25, 300, 50);
    startScreen.highScoreButton = createSprite(canvas.width / 2 - 150, 375, 300, 50);
    startScreen.highScoreButton.shapeColor = "WHITE";
    startScreen.highScoreButton.mouseActive = true;
    startScreen.highScoreButton.setCollider("rectangle", 150, 25, 300, 50);
    startScreen.backButton = createSprite(canvas.width / 2 - 150, 2000, 300, 50);
    startScreen.backButton.shapeColor = "WHITE";
    startScreen.backButton.mouseActive = true;
    startScreen.backButton.setCollider("rectangle", 150, 25, 300, 50);

}
function title() {
    title.buttonPressed;
    title.button=null;
    if(!startScreen.finished) {
        if (startScreen.startButton.mouseIsPressed) {
            title.buttonPressed = true;
            title.button = "start";
        }
        if (startScreen.instructionsButton.mouseIsPressed) {
            title.buttonPressed = true;
            title.button = "instructions";
        }
        if (startScreen.highScoreButton.mouseIsPressed) {
            title.buttonPressed = true;
            title.button = "high score";
        }
        if (!startScreen.finished) {
            textSize(50);
            textFont("Helvetica");
            fill(230, 0, 0);
            textAlign(CENTER);
            text("Brick Breaker Pong", canvas.width / 2, 125);
        }
        if (!title.buttonPressed) {
            textSize(35);
            textFont("Helvetica");
            fill(230, 0, 0);
            textAlign(CENTER);
            text("Play", canvas.width / 2, 210);
            text("Instructions", canvas.width / 2, 310);
            text("Local High Score", canvas.width / 2, 410);
            textSize(25);
            text("Made by Maxx Marian for AS Computer Science Midterm", canvas.width / 2, 575);
        }
        if (title.buttonPressed) {
            if (title.button === "start") {
                newGame();
                startScreen.finished = true;

            }
            if (title.button === "instructions") {
                startScreen.startButton.position.y = 540;
                startScreen.startButton.position.x = canvas.width / 2 + 10;
                startScreen.backButton.position.y = 540;
                startScreen.backButton.position.x = canvas.width / 2 - 310;
                startScreen.instructionsButton.remove();
                startScreen.highScoreButton.remove();
                textSize(35);
                textFont("Helvetica");
                fill(230, 0, 0);
                textAlign(CENTER);
                text("Play", canvas.width / 2 + 160, 575);
                text("Back", canvas.width / 2 - 160, 575);
                if (startScreen.startButton.mouseIsPressed) {
                    newGame();
                    startScreen.finished = true;
                }
                if (startScreen.backButton.mouseIsPressed) {
                    startScreen();
                }
                textSize(30);
                textFont("Helvetica");
                textAlign(LEFT);
                fill(230, 0, 0);
                text("Brick Breaker Pong is a game that combines elements of Pong", 140, 175);
                text("and Brick Breaker to create a unique new game.", 140, 210);
                text("The Objective is to hit the ball through the opponents base", 140, 245);
                text("using the paddles. The ball speeds up each time it hits a paddle,", 140, 280);
                text("while the size of the paddles remain constant, thereby increasing", 140, 315);
                text("the difficulty as the game progresses. The score does not play a", 140, 350);
                text("role in the winner of the game, but rather is the difference in hits", 140, 385);
                text("of the ball by each player, which shows how close a game was after", 140, 420);
                text("a winner is declared. A high score shows that the winner won by a lot,", 140, 455);
                text("and a low one means they perhaps should have lost. This acts as a player", 140, 490);
                text("rating, so someone with a higher score should be hard to beat. Have fun!", 140, 525);

            }
            if (title.button === "high score") {
                startScreen.startButton.position.y = 540;
                startScreen.startButton.position.x = canvas.width / 2 + 10;
                startScreen.backButton.position.y = 540;
                startScreen.backButton.position.x = canvas.width / 2 - 310;
                startScreen.instructionsButton.remove();
                startScreen.highScoreButton.remove();
                textSize(35);
                textFont("Helvetica");
                fill(230, 0, 0);
                textAlign(CENTER);
                text("Play", canvas.width / 2 + 160, 575);
                text("Back", canvas.width / 2 - 160, 575);
                textSize(45);
                if (playerData.globalHighScore !== 0) {
                    text("This computer's current High Score is " + localStorage.highestScore + ",", canvas.width / 2, 200);
                    text("and is held by " + localStorage.highScoreHolder + "!", canvas.width / 2, 250);
                }
                if (playerData.globalHighScore === 0) {
                    text("A Positive High score has not been set yet", canvas.width / 2, 200);
                    text("on this computer, so go set one!", canvas.width / 2, 250);
                }
                if (startScreen.startButton.mouseIsPressed) {
                    newGame();
                    startScreen.finished = true;
                }
                if (startScreen.backButton.mouseIsPressed) {
                    startScreen();
                }
            }
        }
    }
}