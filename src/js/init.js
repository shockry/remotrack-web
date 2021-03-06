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

import {requestService} from './bluetooth';
import {draw as openingStateDraw} from './spaceship';

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
export let center;
let buttonSize;

export function draw() {
  center = {x: canvas.width/2, y: canvas.height/2};
  buttonSize = {width: canvas.width/2, height: canvas.height/2};
  ctx.save();

  drawConnectButton();

  // Listen to mouse clicks on the button
  canvas.addEventListener('mousedown', animateButton);
  canvas.addEventListener('mouseup', openNextState);
}


function drawConnectButton() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  ctx.translate(center.x, center.y);
  ctx.save();

  ctx.fillStyle = "rgb(30, 186, 255)";
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 5;
  ctx.shadowColor = "rgb(46, 47, 48)";

  ctx.fillRect(-(buttonSize.width/2), -(buttonSize.height/2),
               buttonSize.width, buttonSize.height);
  ctx.restore();
  drawConnectText(ctx, canvas);
}


function drawBackground() {
  ctx.fillStyle = "rgb(146, 31, 147)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawConnectText(ctx, canvas, clicked=false) {
  ctx.font = "50px Helvetica";
  const connectText = "CONNECT";
  const textProps = ctx.measureText(connectText);
  if (clicked === true) {
    ctx.fillText(connectText, -(textProps.width/2)+3, 3);
  } else {
    ctx.fillText(connectText, -(textProps.width/2), 0);
  }
}

function animateButton() {
  ctx.restore();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  drawBackground();
  ctx.translate(center.x, center.y);
  ctx.save();
  ctx.fillStyle = "rgb(30, 186, 255)";
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.shadowBlur = 5;
  ctx.shadowColor = "rgb(46, 47, 48)";

  ctx.fillRect(-(buttonSize.width/2)+3, -(buttonSize.height/2)+3,
               buttonSize.width, buttonSize.height);
  ctx.restore();
  drawConnectText(ctx, canvas, true);
}

function openNextState(e) {
  if (e.offsetX >= center.x-(buttonSize.width/2) &&
      e.offsetX <= center.x-(buttonSize.width/2) + buttonSize.width &&
      e.offsetY >= center.y-(buttonSize.height/2) &&
      e.offsetY <= center.y-(buttonSize.height/2) + buttonSize.height) {
        ctx.restore();
        ctx.save();
        drawConnectButton();
        ctx.restore();
        //Request phone permission and open the game
        const serviceRequest = requestService();
        serviceRequest.then(service => {
          // In case the player canceled the pairing dialog, do nothing
          if (service) {
            clearEventListeners();
            // Clean up, revert the translation to center to start over
            openingStateDraw(service);
          }
        });
  }
}

function clearEventListeners() {
  canvas.removeEventListener('mousedown', animateButton);
  canvas.removeEventListener('mouseup', openNextState);
}
