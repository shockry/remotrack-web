/*
  RemoTrack, remotely-controlled web games using phone sensors over bluetooth
  Copyright (C) 2017  Shockry

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

import {center, ctx, canvas} from './init';

let tiltAngle, player, enemy, score, actionButtonDown, bestScore=0;
// Guard against garbage collection
let bestScoreCharacteristic, replayButtonCharacteristic, tiltCharacteristic;

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
  constructor(size, position, translation, speed, colors) {
    super(size, position, colors);
    this.translation = translation;
    this.speed = speed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.translation.x, this.translation.y);
    // If remote button is down, move
    if (actionButtonDown === 1) {
      // If rotated 5 degrees to either directions, start moving
      if (tiltAngle > 0.08726646259971647) {
        this.translation.y += this.speed*tiltAngle;
      } else if (tiltAngle < -0.08726646259971647) {
        this.translation.y += this.speed*tiltAngle;
      }
    }
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


export function draw(service, forReplay=false) {
  initializeGlobals();

  // Do not re-subscribe to characteristics if we are just replaying
  if (forReplay) {
    drawScene();
  } else {
    subscribeToCharacteristics(service);
  }
}


function initializeGlobals() {
  tiltAngle = 0;
  score = 0;
  actionButtonDown = 0;

  player = new PlayerShip(40, {x: 0, y: 0}, {x: 90, y:center.y}, 3, {
                               main: "rgb(0, 100, 200)",
                               middle: "rgb(0, 20, 200)",
                               bottom: "rgb(0, 50, 200)"
                             });

  enemy = new EnemyShip(30, {x: canvas.width, y: center.y+100}, 5, {
                               main: "rgb(200, 100, 0)",
                               middle: "rgb(200, 20, 0)",
                               bottom: "rgb(200, 50, 0)"
                             });
}


function subscribeToCharacteristics(service) {
  // Best score characteristic
  service.getCharacteristic('cb6eede9-6aa5-4253-8629-31c53bc246cd')
  .then(characteristic => {
    bestScoreCharacteristic = characteristic;
    return characteristic.readValue();
  })
  .then(score => {
    let lastBest = score.getUint32(0, true);
    bestScore = lastBest
  })
  // Get Replay button pressed notifications
  .then(_ => service.getCharacteristic('941e4433-fae2-4ef4-aeec-3866ff4c4bf3'))
  .then(characteristic => {
    replayButtonCharacteristic = characteristic;
    return characteristic.startNotifications().then(_ => {
      replayButtonCharacteristic.addEventListener('characteristicvaluechanged', replay);
    });
  })
  // Get tilting characteristic, draw the game and listen to changes in angle
  .then (_ => service.getCharacteristic('fd0a7b0b-629f-4179-b2dc-7ef53bd4fe8b'))
  .then(characteristic => {
    tiltCharacteristic = characteristic;
    return characteristic.startNotifications().then(_ => {
      tiltCharacteristic.addEventListener('characteristicvaluechanged', updateAngle);
      drawScene();
    });
  })
  .catch(error => { console.log(error); });
}


function updateAngle(e) {
  actionButtonDown = e.target.value.getUint8(0);
  tiltAngle = e.target.value.getFloat64(1, true);
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
    if (score > bestScore) {
      bestScore = score;
    }
    drawLoss()
    sendScoreToRmote()
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
  const lossText = `You Scored  ${score}`;
  const bestScoreText = `Your Best is  ${bestScore}`;
  const lossTextProps = ctx.measureText(lossText);
  const bestScoreTextProps = ctx.measureText(bestScoreText);
  ctx.fillText(lossText, center.x-(lossTextProps.width/2), center.y-40);
  ctx.fillText(bestScoreText, center.x-(bestScoreTextProps.width/2), center.y+20);

  ctx.restore();
}


function enemyCollides() {
  const enemyLeft = enemy.position.x - (enemy.dimensions.width/2);
  const enemyRight = enemy.position.x + (enemy.dimensions.width/2);
  const enemyBottom = enemy.position.y + (enemy.dimensions.height-enemy.size);
  const enemyTop = enemy.position.y - enemy.size;

  const playerLeft = player.translation.x - (player.dimensions.width/2);
  const playerRight = player.translation.x + (player.dimensions.width/2);
  const playerBottom = player.translation.y + ( player.dimensions.height-player.size);
  const playerTop = player.translation.y - player.size;

  const bulletLeft = enemy.bulletPosition.x - enemy.bulletSize;
  const bulletRight = enemy.bulletPosition.x + enemy.bulletSize;
  const bulletBottom = enemy.bulletPosition.y + enemy.bulletSize;
  const bulletTop = enemy.bulletPosition.y - enemy.bulletSize;

  return (
          ( // Check for enemy ship collision
            (enemyLeft <= playerRight && enemyRight >= playerLeft) &&
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
            (bulletLeft <= playerRight && bulletRight >= playerLeft) &&
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


function sendScoreToRmote() {
  const currentScore =  new Uint32Array([score]);
  bestScoreCharacteristic.writeValue(currentScore)
  .then(_ => {
    return true;
  })
}


function replay(e) {
  const val = e.target.value.getUint8(0);
  if (val === 1) {
    draw(null, true);
  }
}
