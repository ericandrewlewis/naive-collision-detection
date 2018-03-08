const random = (min, max) => {
  const distance = max - min;
  return Math.floor(Math.random() * distance) + min;
};
const loop = (times, fn) => {
  new Array(times).fill(0).forEach(fn);
};
const platforms = [];

let verticalSpeed = 0;
let horizontalSpeed = 0;
// Acceleration is 10 pixels a second
let acceleration = 10;
let playerElement;
const playerSize = 10;
const platformSize = {
  x: 20,
  y: 10
};
let player = { top: 0, right: playerSize, bottom: playerSize, left: 0 };
let keysDown = {
  leftArrow: false,
  rightArrow: false
};

const createSVG = () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  draw = SVG(svg);
  return draw;
};
const createPlayer = () => {
  draw = createSVG();
  playerElement = draw.node;
  playerElement.setAttribute("class", "player");
  document.body.appendChild(playerElement);
  draw.viewbox(0, 0, 1, 1).rect(1, 1);
};
const createPlatform = () => {
  draw = createSVG();
  draw.node.setAttribute("class", "platform");
  document.body.appendChild(draw.node);
  draw.viewbox(0, 0, 2, 1).rect(2, 1);
  const x = random(0, window.innerWidth - platformSize.x);
  const y = random(0, window.innerHeight - platformSize.y);
  // const x = 10;
  // const y = 100;
  platforms.push({
    left: x,
    top: y,
    bottom: y + platformSize.y,
    right: x + platformSize.x
  });
  draw.node.style.left = x.toString() + "px";
  draw.node.style.top = y.toString() + "px";
};
const createPlatforms = () => {
  loop(100, createPlatform);
};

const getCollisions = player => {
  return platforms.filter(platform => {
    const horizontalOverlap =
      platform.left < player.right && platform.right > player.left;
    const veticalOverlap =
      platform.top < player.bottom && platform.bottom > player.top;
    return horizontalOverlap && veticalOverlap;
  });
};

const updatePlayer = ({ top, left }) => {
  player.top = top;
  player.bottom = top + playerSize;

  player.left = left;
  player.right = left + playerSize;
  playerElement.style.top = top.toString() + "px";
  playerElement.style.left = left.toString() + "px";
};
let lastTimestamp = 0;

const getNextPlayerLocationWithoutCollision = () => {
  let top = parseInt(playerElement.style.top) || 0;
  let left = parseInt(playerElement.style.left) || 0;
  top += verticalSpeed;

  left += horizontalSpeed;
  if (top > window.innerHeight - playerElement.clientHeight) {
    top = window.innerHeight - playerElement.clientHeight;
  }
  return {
    top,
    left,
    right: left + playerSize,
    bottom: top + playerSize
  };
};

const updatePlayerForCollision = () => {
  verticalSpeed = 0;

  updatePlayer({
    top: collisions[0].top - playerSize,
    left: nextPlayerLocation.left
  });
};

const frame = timestamp => {
  const secondsSinceLastFrame = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  verticalSpeed += secondsSinceLastFrame * acceleration;
  if (keysDown.rightArrow) {
    horizontalSpeed += secondsSinceLastFrame * acceleration;
  }
  if (keysDown.leftArrow) {
    horizontalSpeed -= secondsSinceLastFrame * acceleration;
  }

  const nextPlayerLocation = getNextPlayerLocationWithoutCollision();

  const collisions = getCollisions(nextPlayerLocation);

  // If there's a collision, place the player
  if (collisions.length > 0) {
    updatePlayerForCollision();
  } else {
    updatePlayer({
      top: nextPlayerLocation.top,
      left: nextPlayerLocation.left
    });
  }

  // Jump
  if (keysDown.upArrow) {
    if (
      collisions.length > 0 ||
      player.top === window.innerHeight - playerSize
    ) {
      verticalSpeed = -5;
    }
  }

  window.requestAnimationFrame(frame);
};
createPlayer();
createPlatforms();
window.requestAnimationFrame(frame);

const onKeydown = evt => {
  switch (evt.keyCode) {
    case 37:
      keysDown.leftArrow = true;
      break;
    case 38:
      keysDown.upArrow = true;
      break;
    case 39:
      keysDown.rightArrow = true;
      break;
  }
};

const onKeyup = evt => {
  switch (evt.keyCode) {
    case 37:
      keysDown.leftArrow = false;
      break;
    case 38:
      keysDown.upArrow = false;
      break;
    case 39:
      keysDown.rightArrow = false;
      break;
  }
};

document.addEventListener("keydown", onKeydown);
document.addEventListener("keyup", onKeyup);
