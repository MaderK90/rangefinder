const SERVICE_UUID = "375bb10c-f55c-11ed-a05b-0242ac120003";
const RANGE_UUID = "375bb3d2-f55c-11ed-a05b-0242ac120003";


const buttonRange = document.getElementById("activateRange");


const rangeElement = document.getElementById("range");
const m2Element = document.getElementById("m2");
var myService = null;
const buttonConnectBLE = document.getElementById("ButtonConnect");


document.getElementById("RangeButton").addEventListener('pointerdown', measureDistance);
document.getElementById("m2Button").addEventListener('pointerdown', measureDistance);



document.getElementById("ButtonConnect").addEventListener('pointerdown', () => {

        console.log("Starting connect");

        navigator.bluetooth.requestDevice({
            filters: [{
                services: [SERVICE_UUID]
            }]
        })
        .then(device => device.gatt.connect())
        .then(server => server.getPrimaryService(SERVICE_UUID))
        .then(service => {
            myService = service;
            console.log(myService);
        });
        console.log("Finishing connect");
       
});


/*buttonConnectBLE.addEventListener('pointerup', () => {
    navigator.bluetooth.requestDevice({
        filters: [{
            services: [SERVICE_UUID]
        }]
    })
    .then(device => device.gatt.connect())
    .then(server => server.getPrimaryService(SERVICE_UUID))
    .then(service => service.getCharacteristic(RANGE_UUID))
    .then(characteristic => characteristic.startNotifications())
    .catch(error => { 
        distanceEl.innerText = error
        button.classList.add("error")
    })
})*/



function measureDistance() {

    if (myService == null) {
        alert("Connect the Bluetooth service first");
        return;
    }
    //var color = this.getAttribute("color");
    //console.log("Color is:"+color);
    //colorData = new DataView(str2ab(color));
    myService.getCharacteristic(RANGE_UUID)
    .then(characteristic => characteristic.writeValue())
    .catch(error => { 
        rangeElement.innerText = error
        //buttonLED.classList.add("error")
    });
}

buttonRange.addEventListener('pointerdown', () => {
    if (myService == null) {
        alert("Connect the Bluetooth service first");
        return;
    }
    myService.getCharacteristic(RANGE_UUID)
    .then(characteristic => characteristic.startNotifications())
    .then(characteristic => {
    characteristic.addEventListener('characteristicvaluechanged',
                                    handleCharacteristicValueChangedTemperature);
    console.log('Notifications for Temperature have been started.');
    })
    .catch(error => { 
        temperatureElement.innerText = error
        button.classList.add("error")
    });
})



/*function handleCharacteristicValueChangedBrightness(event) {
    const value = event.target.value
    brightnessElement.innerText = "Brightness: " + ab2str(value.buffer) + "%"
    console.log("Bightness: " + ab2str(value.buffer) + "%");
}*/

function handleCharacteristicValueChangedRange(event) {
    const value = event.target.value
    rangeElement.innerText = "Zentimeter " + ab2str(value.buffer) + "cm";
    console.log("Zentimeter " + ab2str(value.buffer) + "cm");
}

// https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf))
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 1 byte for each char
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

