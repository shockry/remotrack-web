'use strict';

function requestService() {
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
    .then(server => server.getPrimaryService('4431e162-161e-4dfd-9e90-69872dda137d'))
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

export default {
  requestService,
}
