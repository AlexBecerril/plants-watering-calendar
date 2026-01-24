#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

const int pinSensor = 34;
const int leds[6] = {13,12,14,27,26,25};

const float DRY_VALUE = 4095; //Calibrate
const float WET_VALUE = 0; //Calibrate

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

#define SERVICE_UUID        "12345678-1234-1234-1234-1234567890ab"
#define CHARACTERISTIC_UUID "abcd1234-1234-1234-1234-abcdef123456"

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

void setup()
{
  Serial.begin(115200);
  delay(1000);

  analogReadResolution(12);
  // Initialize leds
  for (int i = 0; i < 6; i++) {
    pinMode(leds[i], OUTPUT);
    digitalWrite(leds[i], LOW);
  }

  //Initialize Ble
  BLEDevice::init("ESP32-Humedad");
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );

  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->start();

  Serial.println("BLE listo, esperando conexión...");
}

void loop()
{
  int moisture = analogRead(pinSensor);
  float moisture_perc = ((DRY_VALUE - moisture) / (DRY_VALUE - WET_VALUE));
  moisture_perc = constrain(moisture_perc, 0.0, 1.0);
 
  int turn_leds_on = 0;
  if(moisture_perc >= 0.7){
    turn_leds_on = 6;
  }else if(moisture_perc >=0.50  && moisture_perc < 0.70){
    turn_leds_on = 5;
  }else if(moisture_perc >= 0.30  && moisture_perc < 0.50){
    turn_leds_on = 4;
  }else if(moisture_perc >= 0.15 && moisture_perc < 0.30){
    turn_leds_on = 3;
  }else if(moisture_perc >= 0.05 && moisture_perc < 0.15){
    turn_leds_on = 2;
  }else if(moisture_perc < 0.05){
    turn_leds_on = 1;
  }
  
  //turn leds on
  for(int i=0; i<turn_leds_on; i++){
    digitalWrite(leds[i], HIGH);
  }
  //turn leds off
  for(int j=5; j>turn_leds_on-1; j--){
    digitalWrite(leds[j], LOW);
  }

  char buffer[50];
  sprintf(buffer, "Raw:%d | Humedad: %.1f%%", moisture, moisture_perc * 100);

  // Serial (USB)
  Serial.println(buffer);

  // BLE
  if (deviceConnected) {
    pCharacteristic->setValue(buffer);
    pCharacteristic->notify();
  }
  
  delay(1000);
}
