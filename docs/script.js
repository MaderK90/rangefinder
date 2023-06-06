const SERVICE_UUID = "375bb10c-f55c-11ed-a05b-0242ac120003";
const RANGE_UUID = "375bb3d2-f55c-11ed-a05b-0242ac120003";



const buttonRange = document.getElementById("activateRange");


const rangeElement = document.getElementById("range");
const m2Element = document.getElementById("m2");
let myService = null;
let rangeCharacteristic = null;

const buttonConnectBLE = document.getElementById("ButtonConnect");
const infoText = document.getElementById("Infotext");


document.getElementById("RangeButton").addEventListener('pointerdown', measureDistance);
document.getElementById("m2Button").addEventListener('pointerdown', measureDistance);



document.getElementById("ButtonConnect").addEventListener('click', async () => {
    try {
      console.log("Starting connect");
      infoText.innerHTML="Starting connect";
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }]
      });
      
      const server = await device.gatt.connect();
      myService = await server.getPrimaryService(SERVICE_UUID);
      console.log(myService);
      infoText.innerHTML="Got Service UID";
      
      rangeCharacteristic = await myService.getCharacteristic(RANGE_UUID);
      rangeCharacteristic.addEventListener('characteristicvaluechanged', handleRangeValueChanged);
      await rangeCharacteristic.startNotifications();
      
      console.log("Connected and subscribed to range notifications");
      infoText.innerHTML="Connected and subscribed to range notifications";
    } catch (error) {
      console.error("Error connecting to BLE device:", error);
      infoText.innerHTML="Error connecting to BLE device:" + error;
      
    }
  });

  document.getElementById("RangeButton").addEventListener('click', async () => {
    try {
      if (!myService) {
        alert("Connect to the Bluetooth service first");
        return;
      }
      
      const value = await rangeCharacteristic.readValue();
      const rangeValue = new DataView(value.buffer).getFloat32(0, true);
      console.log("Range value:", rangeValue);
      infoText.innerHTML="Range value" + rangeValue;
      
      // Do something with the range value...
    } catch (error) {
      console.error("Error reading range value:", error);
      infoText.innerHTML="Error reading range value:", error;
    }
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

function handleRangeValueChanged(event) {
    const value = event.target.value;
    const rangeValue = new DataView(value.buffer).getFloat32(0, true);
    console.log("Range value changed:", rangeValue);
    
    // Do something with the updated range value...
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

