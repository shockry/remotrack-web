'use strict';
import connectionState from './connection';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

connectionState.draw(ctx, canvas);
