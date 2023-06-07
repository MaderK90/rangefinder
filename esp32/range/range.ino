#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>


#undef VERBOSE

//BLE server name
#define bleServerName "BLE Server Kathi"


const int trigPin = 5;
const int echoPin = 18;

bool deviceConnected = false;
bool oldDeviceConnected = false;

#define SERVICE_UUID "375bb10c-f55c-11ed-a05b-0242ac120003"
#define RANGE_UUID "375bb3d2-f55c-11ed-a05b-0242ac120003"

BLEServer *pServer = NULL;


                                       
BLECharacteristic rangeCharacteristic(
      RANGE_UUID, 
      BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ);


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
      std::__cxx11::string value = pCharacteristic->getValue();
      //Serial.println(value);
      //float rangeValue = getRangeValue();
      //Serial.print(rangeValue);
      //pCharacteristic->setValue(42);
    }

    void onWrite(BLECharacteristic *pCharacteristic) {
      //std::__cxx11::string value = pCharacteristic->getValue();
      //Serial.println(value.c_str());
    }
};




void initBLE() {



  BLEDevice::init(bleServerName);
  
  
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

 
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pService->addCharacteristic(&rangeCharacteristic);
  
  rangeCharacteristic.setCallbacks(new BLECharacteristicCallbacks());
  rangeCharacteristic.setValue("Hello World");
  pServer->getAdvertising()->addServiceUUID(SERVICE_UUID);
  pService->start();
  
 
  pServer->getAdvertising()->start();

  Serial.println("Services are started and being advertised...");
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
  Serial.begin(115200);
  initBLE(); // Starts the serial communication
  
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); 
  
  
}
uint8_t simulated_battery_level = 50;

void loop() {

  //Serial.print(getRangeValue());
  //delay(3000);
  /*int value=42;
  rangeCharacteristic.setValue(value);
  rangeCharacteristic.notify();
  delay(5000);
  checkToReconnect();*/

  rangeCharacteristic.setValue(&simulated_battery_level,1); //changing the value
  rangeCharacteristic.notify(); // ..notifying clients that 
  delay(5000); // wait 5 sec.

  simulated_battery_level = simulated_battery_level + 10; // increase the level up to 100 before setting to 0 again
  Serial.println(int(simulated_battery_level));

  if (int(simulated_battery_level) == 100)
    simulated_battery_level=0;



 
}
