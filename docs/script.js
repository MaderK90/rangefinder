const SERVICE_UUID = "375bb10c-f55c-11ed-a05b-0242ac120003";
const RANGE_UUID = "375bb3d2-f55c-11ed-a05b-0242ac120003";

const buttonRange = document.getElementById("activateRange");

const rangeElement = document.getElementById("range");
const m2Element = document.getElementById("m2");
let myService = null;
let rangeCharacteristic = null;

const buttonConnectBLE = document.getElementById("ButtonConnect");
const infoText = document.getElementById("Infotext");

document
  .getElementById("RangeButton")
  .addEventListener("pointerdown", measureDistance);
document
  .getElementById("m2Button")
  .addEventListener("pointerdown", measureDistance);

document.getElementById("ButtonConnect").addEventListener("click", async () => {
    navigator.bluetooth.requestDevice({
        filters: [{
            services: [RANGE_UUID]
        }]
    })
    .then(device => device.gatt.connect())
    .then(server => server.getPrimaryService(SERVICE_UUID))
    .then(service => service.getCharacteristic(RANGE_UUID))
    .then(characteristic => characteristic.startNotifications())
    .then(characteristic => {
    characteristic.addEventListener('characteristicvaluechanged',
                                    handleRangeValueChanged);
    console.log('Notifications have been started.');
    })
    .catch(error => { 
        alert(error)
    })

});

document.getElementById("RangeButton").addEventListener("click", async () => {
  try {
    if (!myService) {
      alert("Connect to the Bluetooth service first");
      return;
    }

    const value = await rangeCharacteristic.readValue();
    const rangeValue = new DataView(value.buffer).getFloat32(0, true);
    console.log("Range value:", rangeValue);
    alert("Range value" + rangeValue);

    document.getElementById("range").innerHTML=rangeValue;
  } catch (error) {
    console.error("Error reading range value:", error);
    alert("Error reading range value:", error);
  }
});

function measureDistance() {
  if (myService == null) {
    alert("Connect the Bluetooth service first");
    return;
  }

  myService
    .getCharacteristic(RANGE_UUID)
    .then((characteristic) => characteristic.writeValue())
    .catch((error) => {
      rangeElement.innerText = error;
    });
}

buttonRange.addEventListener("pointerdown", () => {
  if (myService == null) {
    alert("Connect the Bluetooth service first");
    return;
  }
  myService
    .getCharacteristic(RANGE_UUID)
    .then((characteristic) => characteristic.startNotifications())
    .then((characteristic) => {
      characteristic.addEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChangedTemperature
      );
      console.log("Notifications for Temperature have been started.");
    })
    .catch((error) => {
      temperatureElement.innerText = error;
      button.classList.add("error");
    });
});

function handleRangeValueChanged(event) {
  const value = event.target.value;
  const rangeValue = new DataView(value.buffer).getFloat32(0, true);
  console.log("Range value changed:", rangeValue);

  document.getElementById("range").innerText = rangeValue;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 1 byte for each char
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
