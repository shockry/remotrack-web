'use strict';
import connectionState from './connection';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

ctx.save();
connectionState.draw(ctx, canvas);
