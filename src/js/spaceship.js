'use strict';

import {center, ctx, canvas} from './init';

let tiltAngle=0, player, enemy, score=0;

class SpaceShip {
  constructor(size, position, colors) {
    this.size = size;
    this.colors = colors;
    this.position = position;
    this.dimensions = {width: 3*size, height: size+(size/2)+(size/4)};
  }

  draw() {
    ctx.save();

    ctx.fillStyle = this.colors.main;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI, true);
    ctx.fill();

    ctx.fillStyle = this.colors.bottom;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y+(this.size/4), this.size/2, 0, Math.PI, false);
    ctx.fill();

    ctx.fillStyle = this.colors.middle;
    ctx.beginPath();
    ctx.moveTo(this.position.x+(this.size), this.position.y);
    ctx.lineTo(this.position.x+((this.size)+(this.size/2)), this.position.y+(this.size/2));
    ctx.lineTo(this.position.x-((this.size)+(this.size/2)), this.position.y+(this.size/2));
    ctx.lineTo(this.position.x-this.size, this.position.y);
    ctx.fill();

    ctx.restore();
  }
}

class PlayerShip extends SpaceShip {
  constructor(size, position, translation, colors) {
    super(size, position, colors);
    this.translation = translation;
  }

  draw() {
    ctx.save();
    ctx.translate(this.translation.x, this.translation.y);
    ctx.rotate(tiltAngle);
    super.draw();
    ctx.restore();
  }
}

class EnemyShip extends SpaceShip {
  constructor(size, position, speed, colors) {
    super(size, position, colors);
    this.speed = speed;
    this.bulletPosition = {x: this.position.x, y: this.position.y};
    this.bulletSize = this.size/4;
  }

  draw() {
    super.draw();
    this.position.x -= this.speed;

    this.shoot();

    this.bulletPosition.x -= this.speed*2;

    if (this.position.y < center.y) {
      this.bulletPosition.y += this.speed/2;
    } else {
      this.bulletPosition.y -= this.speed/2;
    }

    if (this.position.x < -this.size*2) {
      score++;
      this.position.x = canvas.width;
      this.position.y = Math.floor(Math.random()*(canvas.height-this.size*4))+this.size*2;
      this.speed = Math.floor(Math.random()*7)+2;
      this.bulletPosition = Object.assign({}, this.position);
    }
  }

  shoot() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.bulletPosition.x, this.bulletPosition.y, this.bulletSize, 0, Math.PI*2);
    ctx.fill();
  }
}


export function draw(service) {
  player = new PlayerShip(40, {x: 0, y: 0}, {x: 90, y:center.y}, {
                               main: "rgb(0, 100, 200)",
                               middle: "rgb(0, 20, 200)",
                               bottom: "rgb(0, 50, 200)"
                             });

  enemy = new EnemyShip(30, {x: canvas.width, y: center.y+100}, 5, {
                               main: "rgb(200, 100, 0)",
                               middle: "rgb(200, 20, 0)",
                               bottom: "rgb(200, 50, 0)"
                             });
  // Get tilting characteristic, draw the game and listen to changes in angle
  service.getCharacteristic('fd0a7b0b-629f-4179-b2dc-7ef53bd4fe8b')
  .then(characteristic => {
    const tiltChar = characteristic;
    return characteristic.startNotifications().then(_ => {
      tiltChar.addEventListener('characteristicvaluechanged',
                                      updateAgle);
      drawScene();
    });
  })
  .catch(error => { console.log(error); });

}


function updateAgle() {
  tiltAngle = event.target.value.getFloat64(0, true);
  console.log(tiltAngle);
}


function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Blue background
  ctx.fillStyle = "rgb(0,204,255)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // Score
  ctx.fillStyle = "rgb(0,0,102)";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 5;
  ctx.shadowColor = "rgb(46, 47, 48)";
  ctx.font = "40px Helvetica";
  const scoreText = score;
  const textProps = ctx.measureText(scoreText);
  ctx.fillText(scoreText, canvas.width-(textProps.width)-10, 60);

  ctx.restore();

  player.draw();
  enemy.draw();
  if (!enemyCollides()) {
    window.requestAnimationFrame(drawScene);
  } else {
    drawLoss();
  }
}

function drawLoss() {
  ctx.save();
  ctx.fillStyle = "rgba(0,100,255, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(0,0,102)";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 5;
  ctx.shadowColor = "rgb(46, 47, 48)";
  ctx.font = "40px Helvetica";
  const lossText = `You scored \n ${score}`;
  const textProps = ctx.measureText(lossText);
  ctx.fillText(lossText, center.x-(textProps.width/2), center.y);

  ctx.restore();
}

function enemyCollides() {
  // Three-way collision detection (top, bottom and front)
  const enemyLeft = enemy.position.x-(enemy.dimensions.width/2);
  const enemyBottom = enemy.position.y+(enemy.dimensions.height-enemy.size);
  const enemyTop = enemy.position.y-enemy.size;

  const playerRight = player.translation.x+(player.dimensions.width/2);
  const playerBottom = player.translation.y+(player.dimensions.height-player.size);
  const playerTop = player.translation.y-player.size;

  const bulletLeft = enemy.bulletPosition.x - enemy.bulletSize;
  const bulletBottom = enemy.bulletPosition.y + enemy.bulletSize;
  const bulletTop = enemy.bulletPosition.y - enemy.bulletSize;

  return (
          ( // Check for enemy ship collision
            enemyLeft <= playerRight &&
            (
              (
                enemyBottom >= playerTop &&
                enemyBottom <= playerBottom
              ) ||
              (
                playerBottom >= enemyTop &&
                playerBottom <= enemyBottom
              )
            )
          ) || // Check for bullet collision
          (
            bulletLeft <= playerRight &&
            (
              (
                bulletBottom >= playerTop &&
                bulletBottom <= playerBottom
              ) ||
              (
                playerBottom >= bulletTop &&
                playerBottom <= bulletBottom
              )
            )
          )
         );
}
