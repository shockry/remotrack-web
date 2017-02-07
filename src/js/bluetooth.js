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

export function requestService() {
  return navigator.bluetooth.requestDevice({
    filters: [{
      name: ["RemoTrack Remote"]
    }],
    optionalServices: ["4431e162-161e-4dfd-9e90-69872dda137d"]
    })
    .then(device => {
      device.addEventListener('gattserverdisconnected', onDisconnected);
      return device.gatt.connect()
    })
    .then(server => {
      // Trust me I have tried, the GC is very aggressive against the server
      // Its big brother is protecting it like this
      document.addEventListener('dummy', () => server);
      return server.getPrimaryService('4431e162-161e-4dfd-9e90-69872dda137d')
    })
    .then(service => {
        return service;
      })
    .catch(error => { console.log(error); });

}

function onDisconnected(e) {
  //TODO make an auto-reconnect function
  const phone = e.target;
  console.log(phone.name + " disconnected :(");
}
