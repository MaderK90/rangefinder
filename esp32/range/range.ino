#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>


#undef VERBOSE

//BLE server name
#define bleServerName "BLE-Server"


const int trigPin = 5;
const int echoPin = 18;

bool deviceConnected = false;
bool oldDeviceConnected = false;

#define SERVICE_UUID "375bb10c-f55c-11ed-a05b-0242ac120003"
#define RANGE_UUID "375bb3d2-f55c-11ed-a05b-0242ac120003"

BLEServer *pServer = NULL;

#define SOUND_SPEED 0.034
#define CM_TO_INCH 0.393701

long duration;
float distanceCm;
float distanceInch;

float getRangeValue(){

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);
  
  // Calculate the distance
  distanceCm = duration * SOUND_SPEED/2;
  Serial.print("Distance (cm): ");
  Serial.println(distanceCm);

  return distanceCm;
}

BLECharacteristic characteristicRange(
    RANGE_UUID,
    BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ
);

class MyServerCallbacks: public BLEServerCallbacks {

  void onConnect(BLEServer* pServer) {
    Serial.println("Device connected");
    deviceConnected = true;
  };
  void onDisconnect(BLEServer* pServer) {
    Serial.println("Device disconnected");
    deviceConnected = false;
  }
};
class MyCallbacks: public BLECharacteristicCallbacks {

    void onRead(BLECharacteristic *pCharacteristic) {
      float rangeValue = getRangeValue();
      Serial.print(rangeValue);
      pCharacteristic->setValue(rangeValue);
    }

    void onWrite(BLECharacteristic *pCharacteristic) {
      getRangeValue();
    }
};




void initBLE() {
  // 1. Create the BLE Device  
  BLEDevice::init(bleServerName);

  // 2. Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // 3. Create the BLE Service to which all the characteristics of the service are bound
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // 4. Create all the characeristics of the service, which represent the functionality
  
  // ---- b) Definition of the BLE RANGE characteristic -------------------------

  pService->addCharacteristic(&characteristicRange);
  // BLE descriptor for the textual description of the service
  BLEDescriptor myRangeDescriptor(BLEUUID((uint16_t)0x2901));
  myRangeDescriptor.setValue("Range in meters");
  characteristicRange.addDescriptor(&myRangeDescriptor);
  // BLE-descriptor for the indication of the status of the notification (On/Off)
  BLEDescriptor myRangeNotificationDescriptor(BLEUUID((uint16_t)0x2902));  
  characteristicRange.addDescriptor(&myRangeNotificationDescriptor);


  // 5. Start the service on the server
  pService->start();

  // 6. Start advertising of the service, after that clients can detect the service
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  //BLEDevice::startAdvertising();
  pServer->getAdvertising()->start();

  // Done with the init...
  Serial.println("Waiting a client connection to notify...");
}






void checkToReconnect() //added
{
  // disconnected so advertise
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    Serial.println("Disconnected: start advertising");
    oldDeviceConnected = deviceConnected;
  }

  // connected so reset boolean control
  if (deviceConnected && !oldDeviceConnected) {
    // do stuff here on connecting
    Serial.println("Reconnected");
    oldDeviceConnected = deviceConnected;
  }
}



void setup() {
  Serial.begin(115200); // Starts the serial communication
  
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); 
  initBLE();// Sets the echoPin as an Input
  
}

void loop() {

  //Serial.print(getRangeValue());
  //delay(3000);
  checkToReconnect();

 
}
