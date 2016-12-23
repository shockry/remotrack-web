'use strict';

function draw(ctx) {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = "rgb(146, 31, 147)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const buttonSize = {width: 200, height: 200};

  const center = {x: canvas.width/2, y: canvas.height/2};
  ctx.translate(center.x, center.y);

  ctx.fillStyle = "rgb(30, 186, 255)";
  ctx.fillRect(center.x-(buttonSize.width/2), center.y-(buttonSize.height/2));

}

export default {
  draw,
}
