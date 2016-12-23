'use strict';

import {center, ctx, canvas} from './init';

let tiltAngle;

function draw(service) {
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
  //ctx.save();
  //ctx.translate(center.x, center.y);

  ctx.fillStyle = "rgb(0,204,255)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  spaceShip.draw();




  // ctx.globalCompositeOperation = 'destination-over';
  // ctx.clearRect(0,0,300,300); // clear canvas
  // ctx.fillStyle = "rgb(0, 100, 200)";
  // ctx.save();
  // ctx.translate(init.center.x, init.center.y);
  // // if ((count) > 0.08726646259971647) {
  // //   direction += 1;
  // // } else if ((count) < -0.08726646259971647) {
  // //   direction += -1;
  // // }
  // //Different axes
  // ctx.rotate(tiltAngle);
  // // playerPos += count;
  // ctx.fillRect (-25, -25, 50, 50);
  // ctx.restore();
  // ctx.fillRect(pos--, 0, 20, size);
  // if (pos < 0) {
  //   pos = canvas.width+10;
  //   size = Math.floor(Math.random() * (80)) + 20
  // }

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

export default {
  draw,
}
