// Bluetooth-UUIDs
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

async function connect() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

    characteristic.addEventListener('characteristicvaluechanged', handleValueChanged);
    await characteristic.startNotifications();

    console.log('Connected to ESP32!');
  } catch (error) {
    console.log('Error connecting to ESP32: ', error);
  }
}

function handleValueChanged(event) {
  const value = event.target.value;
  const sensorValue = value.getUint8(0);

  // Hier kannst du den Code einfügen, um den Sensorwert im Webclient anzuzeigen.
  document.getElementById('range').innerText = sensorValue;
}

connect();

