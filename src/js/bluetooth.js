'use strict';

function requestService() {
  return navigator.bluetooth.requestDevice({
    filters: [{
      name: ["RemoTrack Remote"]
    }],
    optionalServices: ["4431e162-161e-4dfd-9e90-69872dda137d"]
    })
    .then(device => device.gatt.connect())
    .then(server => server.getPrimaryService('4431e162-161e-4dfd-9e90-69872dda137d'))
    .then(service => {
        return service;
      })
    // return service.getCharacteristic('fd0a7b0b-629f-4179-b2dc-7ef53bd4fe8b');
    // })
    // .then(characteristic => {
    //   const koko = characteristic;
    //   return characteristic.startNotifications().then(_ => {
    //     console.log("koko will notify you")
    //     koko.addEventListener('characteristicvaluechanged',
    //                                     beginWrite);
    //   });
    // })

    .catch(error => { console.log(error); });

}

export default {
  requestService,
}
