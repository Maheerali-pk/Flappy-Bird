"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var BOTTOM_HEIGHT = 120;
var canvas = document.querySelector("#canvas");
var ct = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
var backgroundCanvas = document.querySelector("#background");
backgroundCanvas.height = window.innerHeight;
backgroundCanvas.width = window.innerWidth;
var backCt = backgroundCanvas.getContext("2d");
var DRUM_DISTANCE = 200;
var DRUM_PAIR_DISTANCE = 400;
var BRID_HEIGHT = 50;
var BIRD_WIDTH = 60;
var GRAVITY = 0.8;
var DRUM_WIDTH = 100;
var birdImage = new Image();
birdImage.src = "./imgs/bird.png";
var bottomPipe = new Image();
bottomPipe.src = "./imgs/bottom-pipe.png";
var upperPipe = new Image();
upperPipe.src = "./imgs/upper-pipe.png";
function getRandom(max, min) {
    return Math.random() * (max - min) + min;
}
function createDrumPair(x) {
    var random = getRandom(0.35, 0.65);
    var height1 = random * canvas.height - DRUM_DISTANCE / 2;
    var height2 = (1 - random) * canvas.height - DRUM_DISTANCE / 2;
    //console.log(x, height1, height2, random);
    return { height1: height1, height2: height2, x: x };
}
function createDrumPairs() {
    return __spreadArrays(Array(1000)).map(function (_, i) { return createDrumPair(i * DRUM_PAIR_DISTANCE + canvas.width); });
}
var game = {
    drumPairs: createDrumPairs(),
    bird: {
        y: canvas.height / 2 - BRID_HEIGHT,
        speed: 0,
    },
    distance_x: 0,
    gameRunning: false,
};
function renderDrumPairs() {
    game.drumPairs.forEach(function (_a) {
        var height1 = _a.height1, height2 = _a.height2, x = _a.x;
        backCt.drawImage(bottomPipe, x - game.distance_x, canvas.height - height1, DRUM_WIDTH, height1);
        backCt.drawImage(upperPipe, x - game.distance_x, 0, DRUM_WIDTH, height2);
    });
}
function renderBird() {
    backCt.drawImage(birdImage, canvas.width / 2 - BIRD_WIDTH, game.bird.y, BIRD_WIDTH, BRID_HEIGHT);
}
function renderScore() {
    var score = game.drumPairs
        .map(function (pair) { return pair.x; })
        .filter(function (x, i) {
        var val = x - game.distance_x - canvas.width / 2 + DRUM_WIDTH + BIRD_WIDTH;
        return val < 0;
    }).length;
    backCt.textAlign = "left";
    backCt.fillText("Score: " + score, 50, 50);
}
renderDrumPairs();
function clearCanvas() {
    ct.clearRect(0, 0, canvas.height, canvas.width);
}
function updateGame() {
    backCt.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (game.gameRunning) {
        if (isGameOver()) {
            game.gameRunning = false;
            game.bird.y = canvas.height / 2 - BRID_HEIGHT;
            game.distance_x = 0;
            game.drumPairs = createDrumPairs();
        }
        else {
            game.distance_x += 2;
            renderDrumPairs();
            game.bird.y += game.bird.speed;
            game.bird.speed += GRAVITY;
            renderBird();
            renderScore();
        }
    }
    else {
        backCt.textAlign = "center";
        backCt.font = "30px Arial";
        backCt.fillText("Click anywhere to start the game", canvas.width / 2, canvas.height / 2);
    }
    requestAnimationFrame(updateGame);
}
document.onclick = function () {
    game.bird.speed = -7;
    game.gameRunning = true;
};
function isGameOver() {
    if (game.bird.y + BRID_HEIGHT > canvas.height)
        return true;
    var collision = game.drumPairs.some(function (_a, i) {
        var x = _a.x, height2 = _a.height2, height1 = _a.height1;
        var drum1 = {
            x: x - game.distance_x,
            y: canvas.height - height1,
            w: DRUM_WIDTH,
            h: height1,
        };
        var drum2 = { x: x - game.distance_x, y: 0, w: DRUM_WIDTH, h: height2 };
        var bird = {
            x: canvas.width / 2 - BIRD_WIDTH,
            y: game.bird.y,
            w: BIRD_WIDTH,
            h: BRID_HEIGHT,
        };
        if (i === 0) {
            //console.log(drum1, drum2, bird);
        }
        return isColliding(drum1, bird) || isColliding(drum2, bird);
    });
    if (collision)
        return true;
}
function isColliding(box1, box2) {
    //ct.clearRect(0, 0, canvas.height, canvas.width);
    ct.fillStyle = "blue";
    var res = box1.x < box2.x + box2.w &&
        box1.x + box1.w > box2.x &&
        box1.y < box2.y + box2.h &&
        box1.y + box1.h > box2.y;
    return res;
}
updateGame();
