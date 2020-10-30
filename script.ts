const BOTTOM_HEIGHT = 120;
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const ct = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const backgroundCanvas = document.querySelector("#background") as HTMLCanvasElement;
backgroundCanvas.height = window.innerHeight;
backgroundCanvas.width = window.innerWidth;
const backCt = backgroundCanvas.getContext("2d") as CanvasRenderingContext2D;
const DRUM_DISTANCE = 200;
const DRUM_PAIR_DISTANCE = 400;
const BRID_HEIGHT = 50;
const BIRD_WIDTH = 60;
const GRAVITY = 0.8;
const DRUM_WIDTH = 100;

const birdImage = new Image();
birdImage.src = "./imgs/bird.png";

const bottomPipe = new Image();
bottomPipe.src = "./imgs/bottom-pipe.png";

const upperPipe = new Image();
upperPipe.src = "./imgs/upper-pipe.png";

interface Game {
   bird: Bird;
   drumPairs: DrumPair[];
   distance_x: number;
   gameRunning: boolean;
}
interface Bird {
   y: number;
   speed: number;
}
interface DrumPair {
   x: number;
   height1: number;
   height2: number;
}
function getRandom(max: number, min: number) {
   return Math.random() * (max - min) + min;
}
function createDrumPair(x: number) {
   let random = getRandom(0.35, 0.65);
   let height1 = random * canvas.height - DRUM_DISTANCE / 2;
   let height2 = (1 - random) * canvas.height - DRUM_DISTANCE / 2;
   //console.log(x, height1, height2, random);
   return { height1, height2, x };
}
function createDrumPairs() {
   return [...Array(1000)].map((_, i) => createDrumPair(i * DRUM_PAIR_DISTANCE + canvas.width));
}
const game: Game = {
   drumPairs: createDrumPairs(),
   bird: {
      y: canvas.height / 2 - BRID_HEIGHT,
      speed: 0,
   },
   distance_x: 0,
   gameRunning: false,
};

function renderDrumPairs() {
   game.drumPairs.forEach(({ height1, height2, x }) => {
      backCt.drawImage(
         bottomPipe,
         x - game.distance_x,
         canvas.height - height1,
         DRUM_WIDTH,
         height1
      );
      backCt.drawImage(upperPipe, x - game.distance_x, 0, DRUM_WIDTH, height2);
   });
}
function renderBird() {
   backCt.drawImage(birdImage, canvas.width / 2 - BIRD_WIDTH, game.bird.y, BIRD_WIDTH, BRID_HEIGHT);
}
function renderScore() {
   let score = game.drumPairs
      .map((pair) => pair.x)
      .filter((x, i) => {
         let val = x - game.distance_x - canvas.width / 2 + DRUM_WIDTH + BIRD_WIDTH;
         return val < 0;
      }).length;
   backCt.textAlign = "left";
   backCt.fillText(`Score: ${score}`, 50, 50);
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
      } else {
         game.distance_x += 2;
         renderDrumPairs();
         game.bird.y += game.bird.speed;
         game.bird.speed += GRAVITY;
         renderBird();
         renderScore();
      }
   } else {
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
   if (game.bird.y + BRID_HEIGHT > canvas.height) return true;
   let collision = game.drumPairs.some(({ x, height2, height1 }, i) => {
      let drum1: Box = {
         x: x - game.distance_x,
         y: canvas.height - height1,
         w: DRUM_WIDTH,
         h: height1,
      };
      let drum2: Box = { x: x - game.distance_x, y: 0, w: DRUM_WIDTH, h: height2 };
      let bird: Box = {
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
   if (collision) return true;
}

type Box = {
   x: number;
   y: number;
   h: number;
   w: number;
};

function isColliding(box1: Box, box2: Box) {
   //ct.clearRect(0, 0, canvas.height, canvas.width);
   ct.fillStyle = "blue";
   let res =
      box1.x < box2.x + box2.w &&
      box1.x + box1.w > box2.x &&
      box1.y < box2.y + box2.h &&
      box1.y + box1.h > box2.y;
   return res;
}
updateGame();
