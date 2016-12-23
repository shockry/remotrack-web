'use strict';

import bluetooth from './bluetooth';
import spaceshipGame from './spaceship';

let center, buttonSize, canvasObj;
const openingState = spaceshipGame;

function draw(ctx, canvas) {
  canvasObj = canvas;
  center = {x: canvas.width/2, y: canvas.height/2};
  buttonSize = {width: canvas.width/2, height: canvas.height/2};
  // Background
  ctx.fillStyle = "rgb(146, 31, 147)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Connect Button
  drawConnectButton(ctx, canvas);

  // Connect text
  drawConnectText(ctx, canvas);

  // Listen to mouse clicks on the button
  canvas.addEventListener('click', openNextState);
}


function drawConnectButton(ctx, canvas) {
  ctx.translate(center.x, center.y);
  ctx.save();

  ctx.fillStyle = "rgb(30, 186, 255)";
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 5;
  ctx.shadowColor = "rgb(46, 47, 48)";

  ctx.fillRect(-(buttonSize.width/2), -(buttonSize.height/2),
               buttonSize.width, buttonSize.height);
}


function drawConnectText(ctx, canvas) {
  ctx.restore();
  ctx.font = "50px Helvetica";
  const connectText = "CONNECT";
  const textProps = ctx.measureText(connectText);
  ctx.fillText(connectText, -(textProps.width/2), 0);
}


function openNextState(e) {
  if (e.offsetX >= center.x-(buttonSize.width/2) &&
      e.offsetX <= center.x-(buttonSize.width/2) + buttonSize.width &&
      e.offsetY >= center.y-(buttonSize.height/2) &&
      e.offsetY <= center.y-(buttonSize.height/2) + buttonSize.height) {
        //Request phone permission and open the game
        const service = bluetooth.requestService();
        service.then(service => {
          // In case the player canceled the pairing dialog, do nothing
          if (service) {
            canvasObj.removeEventListener('click', openNextState);
            openingState.draw(service);
          }
        });
  }
}


export default {
  draw,
}
