'use strict';

import {center, ctx, canvas} from './init';


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
      this.position.x = canvas.width;
      this.position.y = Math.floor(Math.random()*(canvas.height-this.size*4))+this.size*2;
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

let tiltAngle, player, enemy;

export function draw(service) {
  //Get tilting characteristic, draw the game and listen to changes in angle
  // service.getCharacteristic('fd0a7b0b-629f-4179-b2dc-7ef53bd4fe8b')
  // .then(characteristic => {
  //   const tiltChar = characteristic;
  //   return characteristic.startNotifications().then(_ => {
  //     tiltChar.addEventListener('characteristicvaluechanged',
  //                                     updateAgle);
  //     drawScene();
  //   });
  // })
  // .catch(error => { console.log(error); });
  player = new SpaceShip(40, {x: 90, y:center.y}, {
                               main: "rgb(0, 100, 200)",
                               middle: "rgb(0, 20, 200)",
                               bottom: "rgb(0, 50, 200)"
                             });

  enemy = new EnemyShip(30, {x: canvas.width, y: center.y+30}, 5, {
                               main: "rgb(200, 100, 0)",
                               middle: "rgb(200, 20, 0)",
                               bottom: "rgb(200, 50, 0)"
                             });
  drawScene();
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

  player.draw();
  enemy.draw();

  window.requestAnimationFrame(drawScene);
}

function enemyCollides() {
  // Three-way collision detection (top, bottom and front)
  const enemyLeft = enemy.position.x-(enemy.dimensions.width/2);
  const enemyBottom = enemy.position.y+(enemy.dimensions.height-enemy.size);
  const enemyTop = enemy.position.y-enemy.size;

  const playerRight = player.position.x+(player.dimensions.width/2);
  const playerBottom = player.position.y+(player.dimensions.height-player.size);
  const playerTop = player.position.y-player.size;

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
