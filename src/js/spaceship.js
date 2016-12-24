'use strict';

import {center, ctx, canvas} from './init';

let tiltAngle;
export function draw(service) {
  //Get tilting characteristic, draw the game and listen to changes in angle
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

  spaceShip.draw();

  poleThingy.draw(false);

  window.requestAnimationFrame(drawScene);
}

const spaceShip = {
  size: 40,
  draw() {
    ctx.fillStyle = "rgb(0, 100, 200)";
    ctx.beginPath();
    ctx.arc(center.x, center.y, spaceShip.size, 0, Math.PI, true);
    ctx.fill();

    ctx.fillStyle = "rgb(0, 50, 200)";
    ctx.beginPath();
    ctx.arc(center.x, center.y+(spaceShip.size/4), spaceShip.size/2, 0, Math.PI, false);
    ctx.fill();

    ctx.fillStyle = "rgb(0, 20, 200)";
    ctx.beginPath();
    ctx.moveTo(center.x+(spaceShip.size), center.y);
    ctx.lineTo(center.x+((spaceShip.size)+(spaceShip.size/2)), center.y+(spaceShip.size/2));
    ctx.lineTo(center.x-((spaceShip.size)+(spaceShip.size/2)), center.y+(spaceShip.size/2));
    ctx.lineTo(center.x-spaceShip.size, center.y);
    ctx.fill();
  }
};

const poleThingy = {
  positionX: 0,
  velocity: -2,
  size: {width: 20, height: 50},
  draw(sky=true) {
    if (sky === true) {
      ctx.fillRect(this.positionX+=this.velocity, 0,
                   this.size.width, this.size.height);
      if (this.positionX < 0) {
        this.positionX = canvas.width+20;
      }
    } else {
      ctx.fillRect(this.positionX+=this.velocity, canvas.height-this.size.height,
                   this.size.width, this.size.height);
      if (this.positionX < 0) {
        this.positionX = canvas.width+20;
      }
    }
  },
};
